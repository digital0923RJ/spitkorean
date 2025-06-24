"""
SpitKorean Celery 태스크 패키지
이 패키지는 비동기 백그라운드 작업을 정의합니다.
"""
from celery import Celery
from app.config import Config

# Celery 앱 초기화
celery = Celery('spitkorean')
celery.config_from_object(Config)

# 태스크 불러오기
from . import audio_tasks, analysis_tasks, notification_tasks, content_tasks

__all__ = ['celery',
    'audio_tasks',
    'analysis_tasks', 
    'notification_tasks',
    'content_tasks'
]