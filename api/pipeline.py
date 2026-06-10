import os
import sys
import cv2
import numpy as np
from PIL import Image
import onnxruntime

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

# Heavy model imports removed for memory isolation.
# Subprocess workers will import them on demand.
has_heavy_models = True

class ChromaCrystalPipeline:
    def __init__(self):
        self.models_loaded = False
        self.deoldify_session = None
        # GFPGAN and RealESRGAN are now isolated in subprocess workers
        self.face_enhancer_enabled = True
        self.upscaler_enabled = True

    def load_models(self):
        # Models are no longer loaded into the main process to prevent OOM
        self.models_loaded = True

    def process_image(self, input_path: str, output_path: str, progress_callback=None, upscale_factor=4, color_intensity=1.0, denoise_strength=10, cancel_check=None, enable_colorization=True, enable_face_restoration=True, enable_upscaling=True):
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
        
        if enable_colorization:
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
        else:
            print("Colorization disabled by user. Skipping DeOldify.")
            img_colored = img_enhanced
            
        if enable_colorization and color_intensity != 1.0:
            hsv = cv2.cvtColor(img_colored, cv2.COLOR_BGR2HSV).astype(np.float32)
            hsv[:, :, 1] = np.clip(hsv[:, :, 1] * color_intensity, 0, 255)
            img_colored = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
        if progress_callback: progress_callback(0.5)

        if enable_face_restoration:
            try:
                import subprocess
                import uuid
                print("Running Face Enhancer isolated in subprocess...")
                temp_in = f"temp_in_gfp_{uuid.uuid4().hex}.jpg"
                temp_out = f"temp_out_gfp_{uuid.uuid4().hex}.jpg"
                cv2.imwrite(temp_in, img_colored)
                
                result = subprocess.run([sys.executable, "gfpgan_worker.py", temp_in, temp_out], capture_output=True)
                
                if result.returncode == 0 and os.path.exists(temp_out):
                    img_restored = cv2.imread(temp_out)
                    print("GFPGAN successful. Memory fully released.")
                else:
                    print(f"Subprocess GFPGAN failed: {result.stderr.decode('utf-8')}")
                    img_restored = img_colored
                    
                if os.path.exists(temp_in): os.remove(temp_in)
                if os.path.exists(temp_out): os.remove(temp_out)
            except Exception as e:
                print(f"Face enhancer failed: {e}")
                img_restored = img_colored
        else:
            img_restored = img_colored
            
        if progress_callback: progress_callback(0.7)

        if enable_upscaling:
            try:
                import subprocess
                import uuid
                print("Running Real-ESRGAN Upscaler isolated in subprocess...")
                temp_in = f"temp_in_esr_{uuid.uuid4().hex}.jpg"
                temp_out = f"temp_out_esr_{uuid.uuid4().hex}.jpg"
                cv2.imwrite(temp_in, img_restored)
                
                result = subprocess.run([sys.executable, "realesrgan_worker.py", temp_in, temp_out, str(upscale_factor)], capture_output=True)
                
                if result.returncode == 0 and os.path.exists(temp_out):
                    img_upscaled = cv2.imread(temp_out)
                    print("RealESRGAN successful. Memory fully released.")
                else:
                    print(f"Subprocess RealESRGAN failed: {result.stderr.decode('utf-8')}")
                    h, w = img_restored.shape[:2]
                    img_upscaled = cv2.resize(img_restored, (int(w*upscale_factor), int(h*upscale_factor)), interpolation=cv2.INTER_CUBIC)
                    
                if os.path.exists(temp_in): os.remove(temp_in)
                if os.path.exists(temp_out): os.remove(temp_out)
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
