"""
SpitKorean 번역 API 라우트
Google Translate + OpenAI 기반 번역 서비스
"""
from quart import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
from datetime import datetime

from app.utils.response import api_response, error_response
from app.services.translation_service import TranslationService
from app.core.auth import require_auth

translation_routes = Blueprint('translation', __name__, url_prefix='/api/v1/translation')

@translation_routes.route('/translate', methods=['POST'])
@require_auth  # For production with auth
async def translate_text():
    """텍스트 번역 API
    
    Body:
        text (str): 번역할 텍스트
        source_lang (str): 원본 언어 (기본값: ko)
        target_lang (str): 대상 언어 (기본값: en)
    """
    data = await request.json
    
    if not data or not data.get('text'):
        return error_response("번역할 텍스트가 필요합니다", 400)
    
    translation_service = TranslationService()
    
    try:
        result = await translation_service.translate(
            data.get('text'),
            data.get('source_lang', 'ko'),
            data.get('target_lang', 'en')
        )
        
        return api_response({
            "translated_text": result,
            "source_lang": data.get('source_lang', 'ko'),
            "target_lang": data.get('target_lang', 'en'),
            "original_text": data.get('text')
        }, "번역이 완료되었습니다")
        
    except Exception as e:
        return error_response(f"번역 중 오류가 발생했습니다: {str(e)}", 500)

@translation_routes.route('/explanation', methods=['POST'])
async def translate_explanation():
    """한국어 학습 설명 번역 API
    
    Body:
        explanation (str): 번역할 설명
        target_lang (str): 대상 언어 (기본값: en)
    """
    data = await request.json
    
    if not data or not data.get('explanation'):
        return error_response("번역할 설명이 필요합니다", 400)
    
    translation_service = TranslationService()
    
    try:
        result = await translation_service.translate_explanation(
            data.get('explanation'),
            data.get('target_lang', 'en')
        )
        
        return api_response({
            "translated_explanation": result,
            "target_lang": data.get('target_lang', 'en'),
            "original_explanation": data.get('explanation')
        }, "설명 번역이 완료되었습니다")
        
    except Exception as e:
        return error_response(f"설명 번역 중 오류가 발생했습니다: {str(e)}", 500)

@translation_routes.route('/batch', methods=['POST'])
async def translate_multiple():
    """다중 텍스트 번역 API
    
    Body:
        texts (list): 번역할 텍스트 목록
        source_lang (str): 원본 언어 (기본값: ko)
        target_lang (str): 대상 언어 (기본값: en)
    """
    data = await request.json
    
    if not data or not data.get('texts') or not isinstance(data.get('texts'), list):
        return error_response("번역할 텍스트 목록이 필요합니다", 400)
    
    translation_service = TranslationService()
    
    try:
        results = await translation_service.translate_multiple(
            data.get('texts'),
            data.get('source_lang', 'ko'),
            data.get('target_lang', 'en')
        )
        
        return api_response({
            "translated_texts": results,
            "source_lang": data.get('source_lang', 'ko'),
            "target_lang": data.get('target_lang', 'en'),
            "original_texts": data.get('texts'),
            "count": len(results)
        }, "다중 번역이 완료되었습니다")
        
    except Exception as e:
        return error_response(f"다중 번역 중 오류가 발생했습니다: {str(e)}", 500)

@translation_routes.route('/languages', methods=['GET'])
async def get_supported_languages():
    """지원하는 언어 목록 조회 API"""
    translation_service = TranslationService()
    
    try:
        languages = translation_service.get_supported_languages()
        
        return api_response({
            "languages": languages,
            "count": len(languages)
        }, "지원 언어 목록을 성공적으로 조회했습니다")
        
    except Exception as e:
        return error_response(f"언어 목록 조회 중 오류가 발생했습니다: {str(e)}", 500)

@translation_routes.route('/health', methods=['GET'])
async def translation_health():
    """번역 서비스 상태 확인 API"""
    try:
        translation_service = TranslationService()
        
        # 간단한 번역 테스트
        test_result = await translation_service.translate("안녕하세요", "ko", "en")
        
        return api_response({
            "status": "healthy",
            "test_translation": {
                "original": "안녕하세요",
                "translated": test_result
            },
            "timestamp": datetime.utcnow().isoformat()
        }, "번역 서비스가 정상 작동 중입니다")
        
    except Exception as e:
        return error_response(f"번역 서비스 상태 확인 실패: {str(e)}", 500)