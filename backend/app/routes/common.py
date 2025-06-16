from quart import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import bcrypt
from datetime import datetime
from app.services.gpt_service import GPTService

from app.models.user import User
from app.models.subscription import Subscription
from app.utils.response import api_response, error_response
from app.core.auth import require_auth
gpt_service = GPTService()

common_routes = Blueprint('common', __name__, url_prefix='/api/v1/common')


@common_routes.route('/streak', methods=['POST'])
@require_auth
async def update_streak():
    """연속 학습 일수 업데이트 API"""
    user_id = request.user_id
    
    # 게임화 데이터베이스에서 연속 학습 일수 업데이트
    from app.models.common import Common
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    
    result = await Common.update_streak(db, user_id)
    
    # 이벤트 발행
    if result.get("streak_days") > 0:
        await current_app.event_bus.emit_streak_update(user_id, result.get("streak_days"))
    
    return api_response(result, "연속 학습 정보가 업데이트되었습니다")

##new routes
# New routes created because the frontend was calling a route that did not exist

##endpoint for production
@common_routes.route('/translate', methods=['POST'])
# @require_auth  # ❌ 
async def translate():
    try:
        data = await request.json
        text = data.get('text', '')
        target_language = data.get('target_language') or data.get('target', 'ko')
        source_language = data.get('source_language') or data.get('source', 'ko')

        print(f"🔍 Translate request: {text[:50]}... -> {target_language}")

        if not text:
            return api_response(None, "Missing 'text' parameter", status=400)

        # Simulação simples de tradução para teste
        if target_language == 'ko':
            translated_text = f"[KO] {text}"
        elif target_language == 'en':
            translated_text = f"[EN] {text}"
        else:
            translated_text = f"[{target_language.upper()}] {text}"

        return api_response({
            "original_text": text,
            "translated_text": translated_text,
            "target_language": target_language,
            "source_language": source_language
        }, "Translation completed successfully")
        
    except Exception as e:
        print(f"❌ Translation error: {str(e)}")
        import traceback
        traceback.print_exc()

        return api_response({
            "original_text": text if 'text' in locals() else "",
            "translated_text": text if 'text' in locals() else "",
            "target_language": target_language if 'target_language' in locals() else "ko",
            "source_language": source_language if 'source_language' in locals() else "ko"
        }, "Translation failed, returning original text")


@common_routes.route('/translate-ui', methods=['POST'])
#@require_auth  
async def translate_ui():
    """UI elements translation API"""
    data = await request.json
    ui_elements = data.get('elements', [])
    target_language = data.get('target_language', 'ko')

    if not isinstance(ui_elements, list):
        return api_response(None, "Parameter 'elements' must be a list", status=400)

    translated_elements = []
    for element in ui_elements:
        try:
            if target_language == 'ko':
                prompt = f"Translate this UI text to Korean: {element}"
            elif target_language == 'en':
                prompt = f"Translate this UI text to English: {element}"
            else:
                prompt = f"Translate this UI text to {target_language}: {element}"

            translated = await gpt_service.generate_response([
                {"role": "user", "content": prompt}
            ], "beginner", "en")
            
            translated_elements.append(translated)
        except Exception as e:
            translated_elements.append(element)  # Fallback para texto original

    return api_response({
        "original_elements": ui_elements,
        "translated_elements": translated_elements,
        "target_language": target_language
    }, "UI translation completed successfully")


@common_routes.route('/gamification', methods=['GET'])
@require_auth 
async def get_gamification():
    """게임화 데이터 조회 API"""
    user_id = request.user_id
    
    # 게임화 데이터베이스에서 사용자 정보 조회
    from app.models.common import Common
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    
    gamification = await Common.get_user_gamification(db, user_id)
    
    if not gamification:
        # 게임화 데이터가 없으면 생성
        await Common.create_gamification(db, user_id)
        gamification = await Common.get_user_gamification(db, user_id)
    
    # 필요한 필드만 추출하여 응답
    response_data = {
        "streak_days": gamification.get("streakDays", 0),
        "total_xp": gamification.get("totalXP", 0),
        "current_league": gamification.get("currentLeague", "bronze"),
        "achievements": gamification.get("achievements", []),
        "weekly_progress": gamification.get("weeklyProgress", {"xp": 0})
    }
    
    return api_response(response_data, "게임화 정보를 성공적으로 조회했습니다")

@common_routes.route('/league-ranking', methods=['GET'])
@require_auth 
async def get_league_ranking():
    """리그 랭킹 조회 API"""
    user_id = request.user_id
    
    # 사용자의 리그 확인
    from app.models.common import Common
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    
    gamification = await Common.get_user_gamification(db, user_id)
    
    if not gamification:
        return error_response("게임화 정보를 찾을 수 없습니다", 404)
    
    current_league = gamification.get("currentLeague", "bronze")
    
    # 같은 리그의 상위 사용자 조회
    pipeline = [
        {"$match": {"currentLeague": current_league}},
        {"$sort": {"weeklyProgress.xp": -1}},
        {"$limit": 100},
        {"$lookup": {
            "from": "users",
            "localField": "userId",
            "foreignField": "_id",
            "as": "user"
        }},
        {"$unwind": "$user"},
        {"$project": {
            "_id": 1,
            "userId": 1,
            "weeklyProgress": 1,
            "userName": "$user.profile.name",
            "userEmail": "$user.email"
        }}
    ]
    
    ranking = await db[Common.gamification_collection].aggregate(pipeline).to_list(length=None)
    
    # 사용자 자신의 순위 계산
    user_rank = None
    for i, rank in enumerate(ranking):
        if str(rank.get("userId")) == user_id:
            user_rank = i + 1
            break
    
    # 상위 10명만 반환
    top_ranking = ranking[:10]
    
    # 응답 데이터 가공
    response_data = {
        "league": current_league,
        "user_rank": user_rank,
        "user_weekly_xp": gamification.get("weeklyProgress", {}).get("xp", 0),
        "total_users": len(ranking),
        "top_ranking": [
            {
                "rank": i + 1,
                "name": item.get("userName", "사용자"),
                "weekly_xp": item.get("weeklyProgress", {}).get("xp", 0),
                "is_current_user": str(item.get("userId")) == user_id
            } for i, item in enumerate(top_ranking)
        ]
    }
    
    return api_response(response_data, "리그 랭킹을 성공적으로 조회했습니다")

@common_routes.route('/subscription/plans', methods=['GET'])
async def get_subscription_plans():
    """구독 상품 정보 조회 API"""
    
    # 상품 정보
    plans = [
        {
            "id": "talk",
            "name": "Talk Like You Mean It",
            "description": "자연스러운 대화 학습에 중점을 둔 플랜. 실제 상황과 같은 대화와 음성 응답을 제공합니다.",
            "price": 30.00,
            "daily_limit": 60,
            "features": [
                "AI 튜터와 실시간 대화",
                "감정 인식 및 피드백",
                "모국어 해설 지원",
                "레벨별 맞춤 대화"
            ]
        },
        {
            "id": "drama",
            "name": "Drama Builder",
            "description": "드라마 기반 문장 구성 학습에 중점을 둔 플랜. 실제 드라마 대사로 문법과 표현을 배웁니다.",
            "price": 20.00,
            "daily_limit": 20,
            "features": [
                "실제 드라마 문장 학습",
                "문법 피드백",
                "유사 문장 제시",
                "발음 평가"
            ]
        },
        {
            "id": "test",
            "name": "Test & Study",
            "description": "TOPIK 시험 준비에 중점을 둔 플랜. 문제 풀이와 체계적인 학습으로 실력을 향상시킵니다.",
            "price": 20.00,
            "daily_limit": 20,
            "features": [
                "TOPIK 모의고사",
                "문제 자동 생성",
                "약점 분석",
                "실전 시험 시뮬레이션"
            ]
        },
        {
            "id": "journey",
            "name": "Korean Journey",
            "description": "한글부터 시작하는 체계적인 학습 플랜. 발음과 읽기에 중점을 두어 기초를 탄탄히 합니다.",
            "price": 30.00,
            "daily_limit": 20,
            "features": [
                "한글 기초부터 고급 리딩까지",
                "발음 정확도 분석",
                "속도 조절 연습",
                "단계별 리딩 콘텐츠"
            ]
        }
    ]
    
    # 번들 패키지
    bundles = [
        {
            "id": "bundle_2",
            "name": "2개 선택 패키지",
            "description": "원하는 상품 2개를 선택하여 10% 할인된 가격에 이용하세요.",
            "discount": 0.10,
            "min_products": 2,
            "max_products": 2
        },
        {
            "id": "bundle_3",
            "name": "3개 선택 패키지",
            "description": "원하는 상품 3개를 선택하여 20% 할인된 가격에 이용하세요.",
            "discount": 0.20,
            "min_products": 3,
            "max_products": 3
        },
        {
            "id": "bundle_all",
            "name": "올인원 패키지",
            "description": "모든 상품을 25% 할인된 가격에 이용하세요.",
            "discount": 0.25,
            "min_products": 4,
            "max_products": 4,
            "price": 75.00
        }
    ]
    
    response_data = {
        "plans": plans,
        "bundles": bundles
    }
    
    return api_response(response_data, "구독 상품 정보를 성공적으로 조회했습니다")

def get_product_price(product_id):
    """상품별 가격 조회"""
    prices = {
        "talk": 30.00,
        "drama": 20.00,
        "test": 20.00,
        "journey": 30.00
    }
    return prices.get(product_id, 0.0)

def get_bundle_discount(product_count):
    """번들 할인율 조회"""
    discounts = {
        2: 0.10,  # 10% 할인
        3: 0.20,  # 20% 할인
        4: 0.25   # 25% 할인
    }
    return discounts.get(product_count, 0.0)

def calculate_bundle_price(products):
    """번들 가격 계산"""
    total_price = sum(get_product_price(product) for product in products)
    discount = get_bundle_discount(len(products))
    return total_price * (1 - discount)

@common_routes.route('/subscription/subscribe', methods=['POST'])
@require_auth  
async def subscribe():
    """구독 신청 API"""
    user_id = request.user_id
    data = await request.json
    
    if not data or not data.get('plan_id'):
        return error_response("구독 상품 ID가 필요합니다", 400)
    
    plan_id = data.get('plan_id')
    
    # 번들 구독인 경우
    if plan_id.startswith('bundle_'):
        if not data.get('products') or not isinstance(data.get('products'), list):
            return error_response("번들 구독에는 상품 목록이 필요합니다", 400)
        
        products = data.get('products')
        bundle_type = plan_id.split('_')[1]
        
        # 번들 유형에 따른 상품 개수 검증
        if bundle_type == "2" and len(products) != 2:
            return error_response("2개 선택 패키지는 정확히 2개의 상품을 선택해야 합니다", 400)
        elif bundle_type == "3" and len(products) != 3:
            return error_response("3개 선택 패키지는 정확히 3개의 상품을 선택해야 합니다", 400)
        elif bundle_type == "all" and len(products) != 4:
            return error_response("올인원 패키지는 모든 상품을 포함해야 합니다", 400)
        
        # 결제 처리 (예시)
        # 실제로는 결제 서비스와 연동
        payment_id = "payment_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")
        bundle_price = calculate_bundle_price(products)
        
        # 사용자의 구독 정보 업데이트
        db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
        
        # 각 상품별로 Subscription 모델에 구독 정보 생성
        subscription_ids = []
        for product in products:
            subscription_data = {
                "user_id": user_id,
                "product": product,
                "plan_type": "bundle",
                "bundle_id": plan_id,
                "payment_id": payment_id,
                "status": "active",
                "start_date": datetime.utcnow(),
                "end_date": None,  # 월 구독의 경우 None
                "price": bundle_price / len(products),  # 번들 가격을 상품 수로 나눔
                "discount_applied": get_bundle_discount(len(products))
            }
            
            subscription_id = await Subscription.create(db, subscription_data)
            subscription_ids.append(subscription_id)
            
            # User 모델에도 간단한 정보 저장
            await User.add_subscription(db, user_id, product)
        
        # 이벤트 발행
        await current_app.event_bus.publish("subscription_created", {
            "user_id": user_id,
            "subscription_ids": subscription_ids,
            "plan_id": plan_id,
            "products": products,
            "payment_id": payment_id,
            "total_price": bundle_price,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return api_response({
            "plan_id": plan_id,
            "products": products,
            "payment_id": payment_id,
            "subscription_ids": subscription_ids,
            "total_price": bundle_price,
            "discount_applied": get_bundle_discount(len(products))
        }, "번들 구독이 성공적으로 처리되었습니다", 201)
    
    # 단일 상품 구독인 경우
    else:
        # 결제 처리 (예시)
        # 실제로는 결제 서비스와 연동
        payment_id = "payment_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")
        product_price = get_product_price(plan_id)
        
        # 사용자의 구독 정보 업데이트
        db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
        
        # Subscription 모델로 상세 정보 저장
        subscription_data = {
            "user_id": user_id,
            "product": plan_id,
            "plan_type": "individual",
            "bundle_id": None,
            "payment_id": payment_id,
            "status": "active",
            "start_date": datetime.utcnow(),
            "end_date": None,
            "price": product_price,
            "discount_applied": 0.0
        }
        
        subscription_id = await Subscription.create(db, subscription_data)
        
        # User 모델에도 간단한 정보 저장
        await User.add_subscription(db, user_id, plan_id)
        
        # 이벤트 발행
        await current_app.event_bus.publish("subscription_created", {
            "user_id": user_id,
            "subscription_id": subscription_id,
            "plan_id": plan_id,
            "payment_id": payment_id,
            "price": product_price,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return api_response({
            "plan_id": plan_id,
            "payment_id": payment_id,
            "subscription_id": subscription_id,
            "price": product_price
        }, "구독이 성공적으로 처리되었습니다", 201)

@common_routes.route('/subscription/status', methods=['GET'])
@require_auth  
async def get_subscription_status():
    """사용자 구독 상태 조회 API"""
    user_id = request.user_id
    
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    subscriptions = await Subscription.find_active_by_user(db, user_id)
    
    # 구독 정보 포맷팅
    formatted_subscriptions = []
    for sub in subscriptions:
        formatted_subscriptions.append({
            "subscription_id": str(sub.get("_id")),
            "product": sub.get("product"),
            "plan_type": sub.get("plan_type"),
            "bundle_id": sub.get("bundle_id"),
            "status": sub.get("status"),
            "start_date": sub.get("start_date").isoformat() if sub.get("start_date") else None,
            "end_date": sub.get("end_date").isoformat() if sub.get("end_date") else None,
            "price": sub.get("price"),
            "discount_applied": sub.get("discount_applied", 0.0)
        })
    
    return api_response({
        "subscriptions": formatted_subscriptions,
        "total_subscriptions": len(formatted_subscriptions)
    }, "구독 상태를 성공적으로 조회했습니다")

@common_routes.route('/subscription/cancel', methods=['POST'])
@require_auth  
async def cancel_subscription():
    """구독 취소 API"""
    user_id = request.user_id
    data = await request.json
    
    subscription_id = data.get('subscription_id')
    if not subscription_id:
        return error_response("구독 ID가 필요합니다", 400)
    
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    
    # 구독 소유권 확인
    subscription = await Subscription.find_by_id(db, subscription_id)
    if not subscription:
        return error_response("구독을 찾을 수 없습니다", 404)
    
    if str(subscription.get("user_id")) != user_id:
        return error_response("구독 취소 권한이 없습니다", 403)
    
    # 구독 취소 처리
    success = await Subscription.cancel(db, subscription_id)
    
    if success:
        # 이벤트 발행
        await current_app.event_bus.publish("subscription_cancelled", {
            "user_id": user_id,
            "subscription_id": subscription_id,
            "product": subscription.get("product"),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return api_response({
            "subscription_id": subscription_id,
            "cancelled": True,
            "cancelled_at": datetime.utcnow().isoformat()
        }, "구독이 성공적으로 취소되었습니다")
    else:
        return error_response("구독 취소에 실패했습니다", 500)

@common_routes.route('/subscription/history', methods=['GET'])
@require_auth  
async def get_subscription_history():
    """구독 히스토리 조회 API"""
    user_id = request.user_id
    
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
    
    # 모든 구독 히스토리 조회 (활성/비활성 포함)
    from bson.objectid import ObjectId
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$sort": {"start_date": -1}},
        {"$limit": 50}  # 최근 50개로 제한
    ]
    
    subscriptions = await db[Subscription.collection_name].aggregate(pipeline).to_list(length=None)
    
    # 구독 히스토리 포맷팅
    formatted_history = []
    for sub in subscriptions:
        formatted_history.append({
            "subscription_id": str(sub.get("_id")),
            "product": sub.get("product"),
            "plan_type": sub.get("plan_type"),
            "bundle_id": sub.get("bundle_id"),
            "status": sub.get("status"),
            "start_date": sub.get("start_date").isoformat() if sub.get("start_date") else None,
            "end_date": sub.get("end_date").isoformat() if sub.get("end_date") else None,
            "price": sub.get("price"),
            "discount_applied": sub.get("discount_applied", 0.0),
            "payment_id": sub.get("payment_id")
        })
    
    return api_response({
        "history": formatted_history,
        "total_records": len(formatted_history)
    }, "구독 히스토리를 성공적으로 조회했습니다")