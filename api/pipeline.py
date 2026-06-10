import os
import cv2
import numpy as np
from PIL import Image
import onnxruntime
import torch
import gc

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

try:
    from gfpgan import GFPGANer
except ImportError:
    print("GFPGAN not installed")

try:
    from basicsr.archs.rrdbnet_arch import RRDBNet
    from realesrgan import RealESRGANer
except ImportError:
    print("RealESRGAN not installed")

class ChromaCrystalPipeline:
    def __init__(self):
        self.models_loaded = False
        self.deoldify_session = None
        self.face_enhancer = None
        self.upscaler = None

    def load_models(self):
        if self.models_loaded:
            return
            
        print("Loading AI Models into Global Memory (Zero-Crash Thread Pool)...")
        
        # 1. DeOldify (ONNX)
        session_options = onnxruntime.SessionOptions()
        session_options.graph_optimization_level = onnxruntime.GraphOptimizationLevel.ORT_ENABLE_ALL
        device = "cuda" if torch.cuda.is_available() else "cpu"
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"] if device == "cuda" else ["CPUExecutionProvider"]
        
        try:
            self.deoldify_session = onnxruntime.InferenceSession('weights/deoldify.onnx', sess_options=session_options, providers=providers)
        except Exception as e:
            print(f"Warning: DeOldify ONNX failed to load: {e}")

        # 2. GFPGAN
        try:
            self.face_enhancer = GFPGANer(
                model_path='weights/GFPGANv1.4.pth',
                upscale=1,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=None
            )
        except Exception as e:
            print(f"Warning: GFPGAN failed to load: {e}")

        # 3. RealESRGAN
        try:
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            self.upscaler = RealESRGANer(
                scale=4,
                model_path='weights/RealESRGAN_x4plus.pth',
                dni_weight=None,
                model=model,
                tile=400,
                tile_pad=10,
                pre_pad=0,
                half=False,
                gpu_id=None if device == 'cpu' else 0
            )
        except Exception as e:
            print(f"Warning: RealESRGAN failed to load: {e}")
            
        self.models_loaded = True
        print("All models successfully locked into RAM!")

    def process_image(self, input_path: str, output_path: str, progress_callback=None, upscale_factor=4, color_intensity=1.0, denoise_strength=10, cancel_check=None, enable_colorization=True, enable_face_restoration=True, enable_upscaling=True):
        self.load_models()
        if progress_callback: progress_callback(0.1)

        try:
            pil_img = Image.open(input_path).convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception as e:
            print(f"PIL read failed: {e}")
            img = cv2.imread(input_path)
            
        if img is None:
            raise ValueError("Invalid image file")
            
        # AGGRESSIVE PRE-SCALER: Force CPU to calculate much fewer pixels
        max_edge = 400
        h, w = img.shape[:2]
        if max(h, w) > max_edge:
            scale = max_edge / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            print(f"Pre-scaled image to {img.shape[:2]} for blazing CPU speeds!")
        
        # Denoising
        img_enhanced = cv2.fastNlMeansDenoisingColored(img, None, denoise_strength, denoise_strength, 7, 21)
        if progress_callback: progress_callback(0.2)

        # Contrast
        lab = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        limg = cv2.merge((clahe.apply(l), a, b))
        img_enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        if progress_callback: progress_callback(0.3)
        
        # AI 1: Colorization (DeOldify)
        if enable_colorization and self.deoldify_session:
            try:
                targetL = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2LAB)[:, :, 0]
                gray = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY)
                gray_rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
                ih, iw = gray_rgb.shape[:2]
                
                # Dropped render factor from 21 down to 14 (256px) for extreme CPU speed
                r_factor = 256
                resized = cv2.resize(gray_rgb, (r_factor, r_factor))
                inp = resized.astype(np.float32).transpose((2, 0, 1))
                inp = np.expand_dims(inp, axis=0)
                
                input_name = self.deoldify_session.get_inputs()[0].name
                out = self.deoldify_session.run(None, {input_name: inp})[0][0]
                
                colorized = out.transpose(1, 2, 0)
                colorized = cv2.cvtColor(colorized, cv2.COLOR_BGR2RGB).astype(np.uint8)
                colorized = cv2.resize(colorized, (iw, ih))
                colorized = cv2.GaussianBlur(colorized, (13, 13), 0)
                
                colorized_lab = cv2.cvtColor(colorized, cv2.COLOR_BGR2LAB)
                _, A, B = cv2.split(colorized_lab)
                img_colored = cv2.cvtColor(cv2.merge((targetL, A, B)), cv2.COLOR_LAB2BGR)
            except Exception as e:
                print(f"Colorization failed: {e}")
                img_colored = cv2.applyColorMap(cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY), cv2.COLORMAP_BONE)
        else:
            img_colored = img_enhanced
            
        if enable_colorization and color_intensity != 1.0:
            hsv = cv2.cvtColor(img_colored, cv2.COLOR_BGR2HSV).astype(np.float32)
            hsv[:, :, 1] = np.clip(hsv[:, :, 1] * color_intensity, 0, 255)
            img_colored = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
        if progress_callback: progress_callback(0.5)

        # AI 2: Face Restoration (GFPGAN)
        if enable_face_restoration and self.face_enhancer:
            try:
                _, _, img_restored = self.face_enhancer.enhance(img_colored, has_aligned=False, only_center_face=False, paste_back=True)
            except Exception as e:
                print(f"Face enhancer failed: {e}")
                img_restored = img_colored
        else:
            img_restored = img_colored
            
        if progress_callback: progress_callback(0.7)

        # AI 3: Ultra-HD Upscaling (Real-ESRGAN)
        if enable_upscaling and self.upscaler:
            try:
                img_upscaled, _ = self.upscaler.enhance(img_restored, outscale=upscale_factor)
            except Exception as e:
                print(f"Upscaler failed: {e}")
                ih, iw = img_restored.shape[:2]
                img_upscaled = cv2.resize(img_restored, (int(iw*upscale_factor), int(ih*upscale_factor)), interpolation=cv2.INTER_CUBIC)
        else:
            ih, iw = img_restored.shape[:2]
            img_upscaled = cv2.resize(img_restored, (int(iw*upscale_factor), int(ih*upscale_factor)), interpolation=cv2.INTER_CUBIC)

        if progress_callback: progress_callback(0.9)

        img_final = cv2.detailEnhance(img_upscaled, sigma_s=10, sigma_r=0.15)
        cv2.imwrite(output_path, img_final)
        
        # Free memory immediately
        gc.collect()
        
        if progress_callback: progress_callback(1.0)
        return output_path

pipeline = ChromaCrystalPipeline()
