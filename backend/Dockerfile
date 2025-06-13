# Backend Dockerfile 개선됨
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 보안을 위한 non-root 사용자 생성
RUN useradd --create-home --shell /bin/bash app

# 의존성 파일 복사 및 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 공유 모듈 복사 - 백엔드에서 필요한 shared 모듈
COPY shared/ /app/shared/

# 백엔드 애플리케이션 코드 복사
COPY backend/ ./

# 권한 설정
RUN chown -R app:app /app
USER app

# 환경 변수 설정
ENV PYTHONPATH=/app
ENV PORT=5000
ENV FLASK_APP=app.main:app
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# 헬스 체크 설정
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 포트 노출
EXPOSE 5000

# 애플리케이션 실행 명령
CMD ["hypercorn", "app.main:app", "--bind", "0.0.0.0:5000", "--workers", "4"]
