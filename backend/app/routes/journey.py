from quart import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import uuid
from datetime import datetime, timedelta
from app.models.journey import Journey
from app.models.user import User
from app.utils.response import api_response, error_response
from app.services.gpt_service import GPTService
from app.services.whisper_service import WhisperService
from app.utils.auth_decorator import require_auth, no_auth

journey_routes = Blueprint('journey', __name__, url_prefix='/api/v1/journey')

# 서비스 초기화
gpt_service = GPTService()
whisper_service = WhisperService()

@journey_routes.route('/content', methods=['GET'])
#@current_app.auth_manager.require_auth
@no_auth  # For development
# @require_auth  # For production with auth
async def get_content():
    """리딩 콘텐츠 조회 API"""
    user_id = request.user_id
    
    # 파라미터 확인
    level = request.args.get('level', 'level1')
    content_type = request.args.get('type')
    
    # 레벨 검증
    if level not in ['level1', 'level2', 'level3', 'level4']:
        return error_response("유효하지 않은 레벨입니다. level1, level2, level3, level4 중 하나를 선택하세요.", 400)
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "journey")
    
    if not has_subscription:
        return error_response("Korean Journey 서비스 구독이 필요합니다.", 403)
    
    # 사용 제한 확인
    can_use = await current_app.usage_limiter.check_limit(
        user_id, 
        "journey", 
        current_app.config.get("JOURNEY_DAILY_LIMIT", 20)
    )
    
    if not can_use:
        return error_response("오늘의 사용량을 초과했습니다.", 429)
    
    # 리딩 콘텐츠 조회
    db_journey = current_app.mongo_client[current_app.config.get("MONGO_DB_JOURNEY")]
    content_list = await Journey.find_by_level(db_journey, level, content_type, limit=1)
    
    if not content_list:
        # 콘텐츠가 없는 경우, GPT로 생성
        # 실제 구현에서는 미리 생성된 데이터를 사용하는 것이 좋음
        
        # 레벨별 콘텐츠 생성 프롬프트
        level_descriptions = {
            "level1": "한글 마스터 (완전 초급) 수준의 간단한 한국어 텍스트",
            "level2": "기초 리더 (초급) 수준의 한국어 텍스트",
            "level3": "중급 리더 (중급) 수준의 한국어 텍스트",
            "level4": "고급 리더 (고급) 수준의 한국어 텍스트"
        }
        
        type_descriptions = {
            "hangul": "한글 자음과 모음 학습",
            "reading": "읽기 연습용 텍스트",
            "pronunciation": "발음 연습용 텍스트",
            "dialogue": "대화 형식의 텍스트"
        }
        
        type_str = type_descriptions.get(content_type, "읽기 연습용 텍스트")
        prompt = f"{level_descriptions[level]}를 생성해주세요. 이 텍스트는 {type_str}로 사용됩니다."
        
        # GPT를 사용하여 콘텐츠 생성
        generated_content = await gpt_service.generate_reading_content(prompt, level)
        
        # 레벨별 콘텐츠 설정
        level_settings = {
            "level1": {
                "title": "한글 기초 학습",
                "description": "한글 자음과 모음, 기초 단어를 학습합니다.",
                "recommended_speed": 0.5
            },
            "level2": {
                "title": "일상 한국어 읽기",
                "description": "간단한 일상 대화와 문장을 읽습니다.",
                "recommended_speed": 0.8
            },
            "level3": {
                "title": "중급 한국어 텍스트",
                "description": "뉴스, 블로그 글 등의 중급 텍스트를 읽습니다.",
                "recommended_speed": 1.0
            },
            "level4": {
                "title": "고급 한국어 콘텐츠",
                "description": "문학 작품, 전문적인 글 등의 고급 텍스트를 읽습니다.",
                "recommended_speed": 1.2
            }
        }
        
        # 가이드 생성
        guide = await gpt_service.generate_reading_guide(generated_content, level)
        
        # 생성된 콘텐츠를 DB에 저장
        content_data = {
            "title": level_settings[level]["title"],
            "description": level_settings[level]["description"],
            "level": level,
            "content_type": content_type or "reading",
            "content": {
                "text": generated_content,
                "sentences": [{"id": str(uuid.uuid4()), "text": sentence.strip()} 
                             for sentence in generated_content.split(".") if sentence.strip()],
                "recommended_speed": level_settings[level]["recommended_speed"]
            },
            "guide": guide
        }
        
        await Journey.create(db_journey, content_data)
        content_list = await Journey.find_by_level(db_journey, level, content_type, limit=1)
    
    # 응답 데이터 가공
    if content_list:
        content = content_list[0]
        content_data = {
            "content_id": str(content.get('_id')),
            "title": content.get('title'),
            "description": content.get('description'),
            "level": content.get('level'),
            "content_type": content.get('content_type'),
            "content": content.get('content', {}),
            "guide": content.get('guide', {})
        }
    else:
        # 생성에 실패한 경우
        return error_response("콘텐츠 생성에 실패했습니다.", 500)
    
    # 남은 사용량
    remaining = await current_app.usage_limiter.get_remaining(
        user_id, 
        "journey", 
        current_app.config.get("JOURNEY_DAILY_LIMIT", 20)
    )
    
    return api_response({
        "content": content_data,
        "remaining_usage": remaining
    }, "리딩 콘텐츠를 성공적으로 조회했습니다.")

@journey_routes.route('/submit', methods=['POST'])
#@current_app.auth_manager.require_auth
@no_auth  # For development
# @require_auth  # For production with auth
async def submit_reading():
    """리딩 결과 제출 API"""
    user_id = request.user_id
    
    # 멀티파트 폼 데이터 처리
    form = await request.form
    
    content_id = form.get('content_id')
    reading_speed = float(form.get('reading_speed', 1.0))
    completed_sentences = int(form.get('completed_sentences', 0))
    
    if not content_id:
        return error_response("콘텐츠 ID가 필요합니다.", 400)
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "journey")
    
    if not has_subscription:
        return error_response("Korean Journey 서비스 구독이 필요합니다.", 403)
    
    # 콘텐츠 정보 조회
    db_journey = current_app.mongo_client[current_app.config.get("MONGO_DB_JOURNEY")]
    content = await Journey.find_by_id(db_journey, content_id)
    
    if not content:
        return error_response("콘텐츠를 찾을 수 없습니다.", 404)
    
    # 음성 파일 처리
    audio_file = form.get('audio')
    pronunciation_score = 0
    
    if audio_file:
        # Whisper 서비스로 음성 인식 및 발음 평가
        audio_data = await audio_file.read()
        recognition_result = await whisper_service.transcribe_audio(audio_data)
        
        # 원본 텍스트와 비교하여 발음 점수 계산
        original_text = content.get('content', {}).get('text', '')
        pronunciation_score = await whisper_service.evaluate_pronunciation(
            recognition_result.get('text', ''),
            original_text
        )
    
    # 리딩 기록 저장
    history_id = await Journey.record_reading(
        db_journey,
        user_id,
        content_id,
        reading_speed,
        pronunciation_score,
        completed_sentences
    )
    
    # 게임화 데이터 업데이트
    from app.models.common import Common
    
    # XP 추가 (레벨과 완료 문장 수에 따라)
    level = content.get('level')
    level_multiplier = {
        'level1': 1,
        'level2': 1.5,
        'level3': 2,
        'level4': 3
    }.get(level, 1)
    
    xp_amount = int(completed_sentences * level_multiplier)
    
    # 발음 점수에 따른 추가 XP
    if pronunciation_score > 80:
        xp_amount += 10
    elif pronunciation_score > 60:
        xp_amount += 5
    
    await Common.add_xp(db_users, user_id, xp_amount, "journey_complete")
    
    # 이벤트 발행
    await current_app.event_bus.emit_user_activity(
        user_id, 
        "reading_complete", 
        "journey", 
        {
            "content_id": content_id,
            "level": level,
            "reading_speed": reading_speed,
            "pronunciation_score": pronunciation_score,
            "completed_sentences": completed_sentences
        }
    )
    
    return api_response({
        "history_id": history_id,
        "pronunciation_score": pronunciation_score,
        "reading_speed": reading_speed,
        "completed_sentences": completed_sentences,
        "xp_earned": xp_amount
    }, "리딩 결과가 성공적으로 제출되었습니다.")

@journey_routes.route('/progress', methods=['GET'])
#@current_app.auth_manager.require_auth
@no_auth  # For development
# @require_auth  # For production with auth
async def get_progress():
    """진행 상황 조회 API"""
    user_id = request.user_id
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "journey")
    
    if not has_subscription:
        return error_response("Korean Journey 서비스 구독이 필요합니다.", 403)
    
    # 진행 상황 조회
    db_journey = current_app.mongo_client[current_app.config.get("MONGO_DB_JOURNEY")]
    history_list = await Journey.get_user_history(db_journey, user_id)
    
    # 콘텐츠 정보 조회
    content_ids = [ObjectId(item.get('contentId')) for item in history_list]
    contents = {}
    
    for content_id in content_ids:
        content = await Journey.find_by_id(db_journey, content_id)
        if content:
            contents[str(content_id)] = {
                "title": content.get('title'),
                "level": content.get('level'),
                "content_type": content.get('content_type')
            }
    
    # 응답 데이터 가공
    history_data = []
    for item in history_list:
        content_id = str(item.get('contentId'))
        
        if content_id in contents:
            history_data.append({
                "history_id": str(item.get('_id')),
                "content_id": content_id,
                "content_title": contents[content_id].get('title'),
                "level": contents[content_id].get('level'),
                "content_type": contents[content_id].get('content_type'),
                "reading_speed": item.get('readingSpeed'),
                "pronunciation_score": item.get('pronunciationScore'),
                "completed_sentences": item.get('completedSentences'),
                "date": item.get('date').isoformat() if 'date' in item else None
            })
    
    # 레벨별 통계
    level_stats = {}
    for item in history_data:
        level = item.get('level')
        
        if level not in level_stats:
            level_stats[level] = {
                "count": 0,
                "total_pronunciation": 0,
                "total_sentences": 0
            }
        
        level_stats[level]["count"] += 1
        level_stats[level]["total_pronunciation"] += item.get('pronunciation_score', 0)
        level_stats[level]["total_sentences"] += item.get('completed_sentences', 0)
    
    # 평균 계산
    for level, stats in level_stats.items():
        if stats["count"] > 0:
            stats["avg_pronunciation"] = round(stats["total_pronunciation"] / stats["count"], 2)
            stats["avg_sentences"] = round(stats["total_sentences"] / stats["count"], 2)
        else:
            stats["avg_pronunciation"] = 0
            stats["avg_sentences"] = 0
    
    # 날짜별 통계
    date_stats = {}
    for item in history_data:
        date = item.get('date').split('T')[0] if item.get('date') else None
        
        if date and date not in date_stats:
            date_stats[date] = {
                "count": 0,
                "total_sentences": 0
            }
        
        if date:
            date_stats[date]["count"] += 1
            date_stats[date]["total_sentences"] += item.get('completed_sentences', 0)
    
    # 날짜별 통계 리스트로 변환
    date_stats_list = [
        {
            "date": date,
            "count": stats["count"],
            "total_sentences": stats["total_sentences"]
        }
        for date, stats in date_stats.items()
    ]
    
    # 날짜 기준 정렬
    date_stats_list.sort(key=lambda x: x["date"], reverse=True)
    
    return api_response({
        "history": history_data,
        "level_stats": level_stats,
        "date_stats": date_stats_list,
        "total_readings": len(history_data),
        "total_sentences": sum(item.get('completed_sentences', 0) for item in history_data),
        "avg_pronunciation": round(
            sum(item.get('pronunciation_score', 0) for item in history_data) / 
            max(1, len(history_data)),
            2
        )
    }, "진행 상황을 성공적으로 조회했습니다.")

@journey_routes.route('/usage', methods=['GET'])
#@current_app.auth_manager.require_auth
@no_auth  # For development
# @require_auth  # For production with auth
async def get_usage():
    """사용량 조회 API"""
    user_id = request.user_id
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "journey")
    
    # 남은 사용량 확인
    remaining = await current_app.usage_limiter.get_remaining(
        user_id, 
        "journey", 
        current_app.config.get("JOURNEY_DAILY_LIMIT", 20)
    )
    
    return api_response({
        "product": "journey",
        "has_subscription": has_subscription,
        "daily_limit": current_app.config.get("JOURNEY_DAILY_LIMIT", 20),
        "remaining": remaining,
        "reset_at": (datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat()
    }, "사용량 정보를 성공적으로 조회했습니다.")
