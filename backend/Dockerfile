# Multi-stage build for ARM64 compatibility
FROM python:3.11-slim-bookworm as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN apt-get update && apt-get install -y \
    pkg-config \
    ffmpeg \
    libavformat-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavutil-dev \
    libavfilter-dev \
    libswscale-dev \
    libswresample-dev \
    libopus-dev \
    libvpx-dev \
    libx264-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim-bookworm

WORKDIR /app

# Install runtime dependencies for Playwright and Multimedia
RUN apt-get update && apt-get install -y \
    libgomp1 \
    curl \
    ffmpeg \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    fonts-liberation \
    fonts-unifont \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Install Playwright browsers (chromium only)
RUN playwright install chromium

COPY . .

# Create necessary directories for AI data
RUN mkdir -p /app/data/images /app/data/audio /app/data/datasheets

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
