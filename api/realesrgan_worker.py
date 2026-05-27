import sys
import cv2
import torch

try:
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet
except ImportError:
    print("RealESRGAN not installed")
    sys.exit(1)

def main():
    if len(sys.argv) < 4:
        print("Usage: python realesrgan_worker.py <input_path> <output_path> <upscale_factor>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    upscale_factor = int(sys.argv[3])
    
    try:
        img = cv2.imread(input_path)
        if img is None:
            print("Failed to read input image")
            sys.exit(1)
            
        device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
            
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        upscaler = RealESRGANer(
            scale=4,
            model_path='weights/RealESRGAN_x4plus.pth',
            model=model,
            tile=400,
            tile_pad=10,
            pre_pad=0,
            half=True if device == "cuda" else False,
            device=device
        )
        
        img_upscaled, _ = upscaler.enhance(img, outscale=upscale_factor)
        cv2.imwrite(output_path, img_upscaled)
        sys.exit(0)
    except Exception as e:
        print(f"RealESRGAN processing failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
