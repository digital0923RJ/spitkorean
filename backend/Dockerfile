FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash app

# Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 공유 모듈 복사 - 백엔드에서 필요한 shared 모듈
#COPY shared/ /app/shared/ ##this folder does not exist on back end

# Copy Backend Code
COPY . .

# Permition
RUN chown -R app:app /app
USER app

# Env Variables
ENV PYTHONPATH=/app
ENV PORT=5000
ENV FLASK_APP=app.main:app
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Port
EXPOSE 5000

# Execution comand
CMD ["hypercorn", "app.main:app", "--bind", "0.0.0.0:5000", "--workers", "4"]
