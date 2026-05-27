import sys
import cv2

try:
    from gfpgan import GFPGANer
except ImportError:
    print("GFPGAN not installed")
    sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print("Usage: python gfpgan_worker.py <input_path> <output_path>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        img = cv2.imread(input_path)
        if img is None:
            print("Failed to read input image")
            sys.exit(1)
            
        face_enhancer = GFPGANer(
            model_path='weights/GFPGANv1.4.pth',
            upscale=1,
            arch='clean',
            channel_multiplier=2,
            bg_upsampler=None
        )
        
        _, _, img_restored = face_enhancer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)
        cv2.imwrite(output_path, img_restored)
        sys.exit(0)
    except Exception as e:
        print(f"GFPGAN processing failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
