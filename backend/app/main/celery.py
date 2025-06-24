from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

# Celery instance
celery = Celery(
    'spitkorean',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
)

# Procurar tasks dentro do pacote "app"
celery.autodiscover_tasks(['app'])
