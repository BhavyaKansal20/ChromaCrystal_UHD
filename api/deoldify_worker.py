import sys
import cv2
import numpy as np
import onnxruntime
import gc

def run_deoldify(input_path, output_path):
    try:
        img_enhanced = cv2.imread(input_path)
        if img_enhanced is None:
            sys.exit(1)
            
        targetL = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2LAB)[:, :, 0]
        
        session_options = onnxruntime.SessionOptions()
        session_options.graph_optimization_level = onnxruntime.GraphOptimizationLevel.ORT_ENABLE_ALL
        
        # Determine device
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"] if device == "cuda" else ["CPUExecutionProvider"]
        
        deoldify_session = onnxruntime.InferenceSession('weights/deoldify.onnx', sess_options=session_options, providers=providers)
        
        gray = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY)
        gray_rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
        h, w = gray_rgb.shape[:2]
        
        r_factor = 256
        resized = cv2.resize(gray_rgb, (r_factor, r_factor))
        inp = resized.astype(np.float32).transpose((2, 0, 1))
        inp = np.expand_dims(inp, axis=0)
        
        input_name = deoldify_session.get_inputs()[0].name
        out = deoldify_session.run(None, {input_name: inp})[0][0]
        
        colorized = out.transpose(1, 2, 0)
        colorized = cv2.cvtColor(colorized, cv2.COLOR_BGR2RGB).astype(np.uint8)
        colorized = cv2.resize(colorized, (w, h))
        colorized = cv2.GaussianBlur(colorized, (13, 13), 0)
        
        colorized_lab = cv2.cvtColor(colorized, cv2.COLOR_BGR2LAB)
        _, A, B = cv2.split(colorized_lab)
        colorized_merged = cv2.merge((targetL, A, B))
        img_colored = cv2.cvtColor(colorized_merged, cv2.COLOR_LAB2BGR)
        
        cv2.imwrite(output_path, img_colored)
        sys.exit(0)
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    run_deoldify(sys.argv[1], sys.argv[2])
