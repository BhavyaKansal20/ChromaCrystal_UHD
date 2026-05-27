import os
import cv2
import torch
import numpy as np
from PIL import Image

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
        self.colorizer = None
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
                prototxt = "weights/colorization_deploy_v2.prototxt"
                caffemodel = "weights/colorization_release_v2.caffemodel"
                pts = "weights/pts_in_hull.npy"
                
                net = cv2.dnn.readNetFromCaffe(prototxt, caffemodel)
                pts_arr = np.load(pts)
                class8 = net.getLayerId("class8_ab")
                conv8 = net.getLayerId("conv8_313_rh")
                pts_arr = pts_arr.transpose().reshape(2, 313, 1, 1)
                net.getLayer(class8).blobs = [pts_arr.astype(np.float32)]
                net.getLayer(conv8).blobs = [np.full([1, 313], 2.606, dtype=np.float32)]

                scaled = img_enhanced.astype(np.float32) / 255.0
                lab_scaled = cv2.cvtColor(scaled, cv2.COLOR_BGR2LAB)
                resized = cv2.resize(lab_scaled, (224, 224))
                L = cv2.split(resized)[0]
                L -= 50

                net.setInput(cv2.dnn.blobFromImage(L))
                ab = net.forward()[0, :, :, :].transpose((1, 2, 0))
                ab = cv2.resize(ab, (img_enhanced.shape[1], img_enhanced.shape[0]))

                L_orig = cv2.split(lab_scaled)[0]
                colorized = np.concatenate((L_orig[:, :, np.newaxis], ab), axis=2)
                colorized = cv2.cvtColor(colorized, cv2.COLOR_LAB2BGR)
                colorized = np.clip(colorized, 0, 1)
                img_colored = (colorized * 255).astype(np.uint8)
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
