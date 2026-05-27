import os
import cv2
import torch
import numpy as np
from PIL import Image
import onnxruntime

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

try:
    from gfpgan import GFPGANer
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet
    has_heavy_models = True
except ImportError:
    has_heavy_models = False

class ChromaCrystalPipeline:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
        self.models_loaded = False
        self.deoldify_session = None
        self.face_enhancer = None
        self.upscaler = None

    def load_models(self):
        if self.models_loaded:
            return
        print(f"Loading models on {self.device}...")
        
        if not has_heavy_models:
            print("Heavy model libraries not installed. Running in light/fallback mode.")
            self.models_loaded = True
            return

        try:
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            self.upscaler = RealESRGANer(
                scale=4,
                model_path='weights/RealESRGAN_x4plus.pth',
                model=model,
                tile=400,
                tile_pad=10,
                pre_pad=0,
                half=True if self.device == "cuda" else False,
                device=self.device
            )
        except Exception as e:
            print(f"Warning: Could not load RealESRGAN: {e}")

        try:
            session_options = onnxruntime.SessionOptions()
            session_options.graph_optimization_level = onnxruntime.GraphOptimizationLevel.ORT_ENABLE_ALL
            providers = ["CUDAExecutionProvider", "CPUExecutionProvider"] if self.device == "cuda" else ["CPUExecutionProvider"]
            self.deoldify_session = onnxruntime.InferenceSession('weights/deoldify.onnx', sess_options=session_options, providers=providers)
            print("DeOldify ONNX model loaded successfully.")
        except Exception as e:
            print(f"Warning: Could not load DeOldify ONNX: {e}")

        try:
            self.face_enhancer = GFPGANer(
                model_path='weights/GFPGANv1.4.pth',
                upscale=2,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=self.upscaler
            )
        except Exception as e:
            print(f"Warning: Could not load GFPGAN: {e}")

        self.models_loaded = True

    def process_image(self, input_path: str, output_path: str, progress_callback=None, upscale_factor=4, color_intensity=1.0, denoise_strength=10):
        self.load_models()
        if progress_callback: progress_callback(0.1)

        try:
            # Use PIL for robust format support including .heic, .webp, etc.
            pil_img = Image.open(input_path).convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception as e:
            print(f"PIL read failed, falling back to cv2: {e}")
            img = cv2.imread(input_path)
            
        if img is None:
            raise ValueError("Invalid image file")
        
        img_denoised = cv2.fastNlMeansDenoisingColored(img, None, denoise_strength, denoise_strength, 7, 21)
        if progress_callback: progress_callback(0.2)

        lab = cv2.cvtColor(img_denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl,a,b))
        img_enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        if progress_callback: progress_callback(0.3)
        
        img_colored = img_enhanced
        is_gray = np.mean(np.var(img_enhanced, axis=2)) < 15.0
        if is_gray:
            try:
                if self.deoldify_session is None:
                    raise ValueError("DeOldify model not loaded")
                    
                targetL = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2LAB)[:, :, 0]
                
                # Preprocess for DeOldify
                gray = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY)
                gray_rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
                h, w = gray_rgb.shape[:2]
                
                # DeOldify usually uses 256 for Artistic
                r_factor = 256
                resized = cv2.resize(gray_rgb, (r_factor, r_factor))
                inp = resized.astype(np.float32).transpose((2, 0, 1))
                inp = np.expand_dims(inp, axis=0)
                
                # Inference
                input_name = self.deoldify_session.get_inputs()[0].name
                out = self.deoldify_session.run(None, {input_name: inp})[0][0]
                
                # Postprocess
                colorized = out.transpose(1, 2, 0)
                colorized = cv2.cvtColor(colorized, cv2.COLOR_BGR2RGB).astype(np.uint8)
                colorized = cv2.resize(colorized, (w, h))
                colorized = cv2.GaussianBlur(colorized, (13, 13), 0)
                
                # Merge original luminance with predicted AB
                colorized_lab = cv2.cvtColor(colorized, cv2.COLOR_BGR2LAB)
                _, A, B = cv2.split(colorized_lab)
                colorized_merged = cv2.merge((targetL, A, B))
                img_colored = cv2.cvtColor(colorized_merged, cv2.COLOR_LAB2BGR)
                print("DeOldify colorization successful.")
                
            except Exception as e:
                print(f"Colorization failed: {e}")
                img_colored = cv2.applyColorMap(cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY), cv2.COLORMAP_BONE)
            
        if color_intensity != 1.0:
            hsv = cv2.cvtColor(img_colored, cv2.COLOR_BGR2HSV).astype(np.float32)
            hsv[:, :, 1] = np.clip(hsv[:, :, 1] * color_intensity, 0, 255)
            img_colored = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
        if progress_callback: progress_callback(0.5)

        if self.face_enhancer:
            try:
                _, _, img_restored = self.face_enhancer.enhance(img_colored, has_aligned=False, only_center_face=False, paste_back=True)
            except:
                img_restored = img_colored
        else:
            img_restored = img_colored
            
        if progress_callback: progress_callback(0.7)

        if self.upscaler and not self.face_enhancer:
            try:
                img_upscaled, _ = self.upscaler.enhance(img_restored, outscale=upscale_factor)
            except:
                h, w = img_restored.shape[:2]
                img_upscaled = cv2.resize(img_restored, (int(w*upscale_factor), int(h*upscale_factor)), interpolation=cv2.INTER_CUBIC)
        elif not self.upscaler and not self.face_enhancer:
            h, w = img_restored.shape[:2]
            img_upscaled = cv2.resize(img_restored, (int(w*upscale_factor), int(h*upscale_factor)), interpolation=cv2.INTER_CUBIC)
        else:
            if self.face_enhancer:
                # GFPGAN defaults to 2x. We need to resize to match the requested upscale_factor relative to the original image.
                orig_h, orig_w = img_colored.shape[:2]
                target_w, target_h = int(orig_w * upscale_factor), int(orig_h * upscale_factor)
                img_upscaled = cv2.resize(img_restored, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
            else:
                img_upscaled = img_restored

        if progress_callback: progress_callback(0.9)

        img_final = cv2.detailEnhance(img_upscaled, sigma_s=10, sigma_r=0.15)
        cv2.imwrite(output_path, img_final)
        if progress_callback: progress_callback(1.0)
        
        return output_path

pipeline = ChromaCrystalPipeline()
