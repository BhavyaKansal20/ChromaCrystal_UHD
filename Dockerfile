# Stage 1: Build the Next.js static site
FROM node:20-alpine AS builder
WORKDIR /app
COPY web/package.json ./
RUN npm install --ignore-scripts --legacy-peer-deps
COPY web/ ./
RUN npm run build

# Stage 2: Build the FastAPI Python backend
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for OpenCV and GFPGAN/RealESRGAN
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir basicsr facexlib gfpgan realesrgan --no-build-isolation
RUN pip install --no-cache-dir -r requirements.txt
RUN sed -i 's/from torchvision.transforms.functional_tensor import rgb_to_grayscale/from torchvision.transforms.functional import rgb_to_grayscale/g' /usr/local/lib/python3.10/site-packages/basicsr/data/degradations.py

# Copy API files
COPY api/ .

# Copy static frontend bundle into the API's public folder
COPY --from=builder /app/out /app/public

# Hugging Face Spaces exposes port 7860
EXPOSE 7860

# Run FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
