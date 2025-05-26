"""
SpitKorean API 라우트 패키지
이 패키지는 HTTP 엔드포인트와 라우트 핸들러를 정의합니다.
"""
from quart import Blueprint

# 블루프린트 정의
auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')
talk_bp = Blueprint('talk', __name__, url_prefix='/api/v1/talk')
drama_bp = Blueprint('drama', __name__, url_prefix='/api/v1/drama')
test_bp = Blueprint('test', __name__, url_prefix='/api/v1/test')
journey_bp = Blueprint('journey', __name__, url_prefix='/api/v1/journey')
common_bp = Blueprint('common', __name__, url_prefix='/api/v1/common')
translation_bp = Blueprint('translation', __name__, url_prefix='/api/v1/translation')

# 라우트 등록
from app.routes import auth, talk, drama, test, journey, common, translation

__all__ = [
    'auth_bp', 'talk_bp', 'drama_bp', 'test_bp', 'journey_bp', 'common_bp', 'translation_bp'
]