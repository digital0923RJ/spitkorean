from quart import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import uuid
from datetime import datetime, timedelta 
from app.models.drama import Drama
from app.models.user import User
from app.utils.response import api_response, error_response
from app.services.gpt_service import GPTService
from app.core.auth import require_auth

drama_routes = Blueprint('drama', __name__, url_prefix='/api/v1/drama')

# GPT 서비스 초기화
gpt_service = GPTService()

@drama_routes.route('/sentences', methods=['GET'])
@require_auth  # For production with auth
async def get_sentences():
    """드라마 문장 목록 조회 API"""
    user_id = request.user_id
    
    # 레벨 파라미터 확인
    level = request.args.get('level', 'beginner')
    if level not in ['beginner', 'intermediate', 'advanced']:
        return error_response("유효하지 않은 레벨입니다. beginner, intermediate, advanced 중 하나를 선택하세요.", 400)
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "drama")
    
    if not has_subscription:
        return error_response("Drama Builder 서비스 구독이 필요합니다.", 403)
    
    # 사용 제한 확인
    can_use = await current_app.usage_limiter.check_limit(
        user_id, 
        "drama", 
        current_app.config.get("DRAMA_DAILY_LIMIT", 20)
    )
    
    if not can_use:
        return error_response("오늘의 사용량을 초과했습니다.", 429)
    
    # 드라마 문장 조회
    db_drama = current_app.mongo_client[current_app.config.get("MONGO_DB_DRAMA")]
    dramas = await Drama.find_by_level(db_drama, level, limit=5)
    
    if not dramas:
        # 드라마 데이터가 없는 경우, GPT로 생성
        # 실제 구현에서는 미리 생성된 데이터를 사용하는 것이 좋음
        
        # 레벨별 문장 생성 프롬프트
        prompts = {
            "beginner": "한국어 초급 레벨(3-5단어)의 간단한 한국 드라마 대화 문장 5개를 생성해주세요. 일상 대화 위주로 만들어주세요.",
            "intermediate": "한국어 중급 레벨(7-10단어)의 한국 드라마 대화 문장 5개를 생성해주세요. 감정 표현과 연결어미를 포함해주세요.",
            "advanced": "한국어 고급 레벨(12단어 이상)의 복잡한 한국 드라마 대화 문장 5개를 생성해주세요. 관형절과 고급 표현을 포함해주세요."
        }
        
        # GPT를 사용하여 문장 생성
        generated_sentences = await gpt_service.generate_drama_sentences(prompts[level])
        
        # 생성된 문장을 DB에 저장
        drama_data = {
            "title": f"{level.capitalize()} 드라마 대화",
            "description": f"{level} 레벨에 적합한 드라마 대화 문장",
            "level": level,
            "sentences": [
                {
                    "id": str(uuid.uuid4()),
                    "content": sentence,
                    "translation": "",  # 실제로는 번역 서비스 사용
                    "grammar_points": []  # 실제로는 문법 분석 서비스 사용
                }
                for sentence in generated_sentences
            ],
            "genre": "daily",
            "source": "AI 생성"
        }
        
        await Drama.create(db_drama, drama_data)
        dramas = await Drama.find_by_level(db_drama, level, limit=5)
    
    # 응답 데이터 가공
    sentences = []
    for drama in dramas:
        for sentence in drama.get('sentences', []):
            sentences.append({
                "id": sentence.get('id'),
                "content": sentence.get('content'),
                "translation": sentence.get('translation', ''),
                "grammar_points": sentence.get('grammar_points', []),
                "drama_title": drama.get('title'),
                "drama_id": str(drama.get('_id'))
            })
    
    remaining = await current_app.usage_limiter.get_remaining(
        user_id, 
        "drama", 
        current_app.config.get("DRAMA_DAILY_LIMIT", 20)
    )
    
    return api_response({
        "sentences": sentences,
        "level": level,
        "total": len(sentences),
        "remaining_usage": remaining
    }, "드라마 문장을 성공적으로 조회했습니다.")

@drama_routes.route('/check', methods=['POST'])
@require_auth  # For production with auth
async def check_sentence():
    """문장 구성 확인 API"""
    user_id = request.user_id
    data = await request.json
    
    if not data or not data.get('sentence_id') or not data.get('user_answer'):
        return error_response("문장 ID와 사용자 응답이 필요합니다.", 400)
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "drama")
    
    if not has_subscription:
        return error_response("Drama Builder 서비스 구독이 필요합니다.", 403)
    
    # 레벨 확인
    level = data.get('level', 'beginner')
    
    # 정확한 문장 찾기
    db_drama = current_app.mongo_client[current_app.config.get("MONGO_DB_DRAMA")]
    sentence_id = data.get('sentence_id')
    drama_id = data.get('drama_id')
    
    # 드라마 조회
    drama = await Drama.find_by_id(db_drama, drama_id)
    
    if not drama:
        return error_response("드라마를 찾을 수 없습니다.", 404)
    
    # 문장 찾기
    correct_sentence = None
    for sentence in drama.get('sentences', []):
        if sentence.get('id') == sentence_id:
            correct_sentence = sentence
            break
    
    if not correct_sentence:
        return error_response("문장을 찾을 수 없습니다.", 404)
    
    # 사용자 응답 확인
    user_answer = data.get('user_answer')
    correct_content = correct_sentence.get('content')
    
    # 정답 여부 확인 (간단한 비교)
    # 실제로는 더 정교한 비교 로직 필요
    is_correct = user_answer.strip() == correct_content.strip()
    
    # 유사 문장 생성 (GPT 사용)
    similar_sentences = await gpt_service.generate_similar_sentences(correct_content, level)
    
    # 문법 포인트 추출 (GPT 사용)
    grammar_points = await gpt_service.extract_grammar_points(correct_content, level)
    
    # 진행 상황 업데이트
    await Drama.update_progress(db_drama, user_id, drama_id, sentence_id, is_correct, level)
    
    # 게임화 데이터 업데이트
    from app.models.common import Common
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    
    # 정답이면 XP 추가
    if is_correct:
        xp_amount = 10  # 기본 XP
        
        # 레벨별 추가 XP
        if level == "intermediate":
            xp_amount += 5
        elif level == "advanced":
            xp_amount += 10
        
        await Common.add_xp(db_users, user_id, xp_amount, "drama_complete")
    
    # 이벤트 발행
    await current_app.event_bus.emit_user_activity(
        user_id, 
        "drama_check", 
        "drama", 
        {
            "drama_id": drama_id,
            "sentence_id": sentence_id,
            "is_correct": is_correct,
            "level": level
        }
    )
    
    return api_response({
        "is_correct": is_correct,
        "correct_sentence": correct_content,
        "similar_sentences": similar_sentences,
        "grammar_points": grammar_points,
        "xp_earned": xp_amount if is_correct else 0
    }, "문장 확인이 완료되었습니다.")

@drama_routes.route('/progress', methods=['GET'])
@require_auth  # For production with auth
async def get_progress():
    """진행 상황 조회 API"""
    user_id = request.user_id
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "drama")
    
    if not has_subscription:
        return error_response("Drama Builder 서비스 구독이 필요합니다.", 403)
    
    # 진행 상황 조회
    db_drama = current_app.mongo_client[current_app.config.get("MONGO_DB_DRAMA")]
    progress_list = await Drama.get_user_progress(db_drama, user_id)
    
    # 드라마 정보 조회
    drama_ids = [ObjectId(item.get('dramaId')) for item in progress_list]
    dramas = {}
    
    for drama_id in drama_ids:
        drama = await Drama.find_by_id(db_drama, drama_id)
        if drama:
            dramas[str(drama_id)] = {
                "title": drama.get('title'),
                "level": drama.get('level'),
                "total_sentences": len(drama.get('sentences', []))
            }
    
    # 응답 데이터 가공
    progress_data = []
    for item in progress_list:
        drama_id = str(item.get('dramaId'))
        completed_sentences = item.get('completedSentences', [])
        
        if drama_id in dramas:
            total_sentences = dramas[drama_id].get('total_sentences', 0)
            completion_rate = (len(completed_sentences) / total_sentences) * 100 if total_sentences > 0 else 0
            
            progress_data.append({
                "drama_id": drama_id,
                "drama_title": dramas[drama_id].get('title'),
                "level": dramas[drama_id].get('level'),
                "completed_sentences": len(completed_sentences),
                "total_sentences": total_sentences,
                "completion_rate": round(completion_rate, 2),
                "last_updated": item.get('updated_at').isoformat() if 'updated_at' in item else None
            })
    
    # 레벨별 통계
    level_stats = {
        "beginner": {"completed": 0, "total": 0},
        "intermediate": {"completed": 0, "total": 0},
        "advanced": {"completed": 0, "total": 0}
    }
    
    for item in progress_data:
        level = item.get('level')
        if level in level_stats:
            level_stats[level]["completed"] += item.get('completed_sentences', 0)
            level_stats[level]["total"] += item.get('total_sentences', 0)
    
    for level, stats in level_stats.items():
        if stats["total"] > 0:
            stats["completion_rate"] = round((stats["completed"] / stats["total"]) * 100, 2)
        else:
            stats["completion_rate"] = 0
    
    return api_response({
        "progress": progress_data,
        "level_stats": level_stats,
        "total_completed": sum(item.get('completed_sentences', 0) for item in progress_data)
    }, "진행 상황을 성공적으로 조회했습니다.")

@drama_routes.route('/usage', methods=['GET'])
@require_auth  # For production with auth
async def get_usage():
    """사용량 조회 API"""
    user_id = request.user_id
    
    # 구독 상태 확인
    db_users = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    has_subscription = await User.has_active_subscription(db_users, user_id, "drama")
    
    # 남은 사용량 확인
    remaining = await current_app.usage_limiter.get_remaining(
        user_id, 
        "drama", 
        current_app.config.get("DRAMA_DAILY_LIMIT", 20)
    )
    
    return api_response({
        "product": "drama",
        "has_subscription": has_subscription,
        "daily_limit": current_app.config.get("DRAMA_DAILY_LIMIT", 20),
        "remaining": remaining,
        "reset_at": (datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat()
    }, "사용량 정보를 성공적으로 조회했습니다.")
