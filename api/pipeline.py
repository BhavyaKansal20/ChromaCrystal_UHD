import os
import sys
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
            self.face_enhancer = GFPGANer(
                model_path='weights/GFPGANv1.4.pth',
                upscale=1,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=None
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
        
            try:
                import subprocess
                import uuid
                
                print("Running DeOldify isolated in subprocess...")
                temp_in = f"temp_in_{uuid.uuid4().hex}.jpg"
                temp_out = f"temp_out_{uuid.uuid4().hex}.jpg"
                cv2.imwrite(temp_in, img_enhanced)
                
                result = subprocess.run([sys.executable, "deoldify_worker.py", temp_in, temp_out], capture_output=True)
                
                if result.returncode == 0 and os.path.exists(temp_out):
                    img_colored = cv2.imread(temp_out)
                    print("DeOldify colorization successful. Memory fully released.")
                else:
                    print(f"Subprocess colorization failed: {result.stderr.decode('utf-8')}")
                    img_colored = cv2.applyColorMap(cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY), cv2.COLORMAP_BONE)
                    
                if os.path.exists(temp_in): os.remove(temp_in)
                if os.path.exists(temp_out): os.remove(temp_out)
                
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
                print("Running Face Enhancer...")
                _, _, img_restored = self.face_enhancer.enhance(img_colored, has_aligned=False, only_center_face=False, paste_back=True)
            except Exception as e:
                print(f"Face enhancer failed: {e}")
                img_restored = img_colored
        else:
            img_restored = img_colored
            
        if progress_callback: progress_callback(0.7)

        if self.upscaler:
            try:
                print("Running Real-ESRGAN Upscaler...")
                img_upscaled, _ = self.upscaler.enhance(img_restored, outscale=upscale_factor)
            except Exception as e:
                print(f"Upscaler failed: {e}")
                h, w = img_restored.shape[:2]
                img_upscaled = cv2.resize(img_restored, (int(w*upscale_factor), int(h*upscale_factor)), interpolation=cv2.INTER_CUBIC)
        else:
            h, w = img_restored.shape[:2]
            img_upscaled = cv2.resize(img_restored, (int(w*upscale_factor), int(h*upscale_factor)), interpolation=cv2.INTER_CUBIC)

        if progress_callback: progress_callback(0.9)

        img_final = cv2.detailEnhance(img_upscaled, sigma_s=10, sigma_r=0.15)
        cv2.imwrite(output_path, img_final)
        if progress_callback: progress_callback(1.0)
        
        return output_path

pipeline = ChromaCrystalPipeline()
