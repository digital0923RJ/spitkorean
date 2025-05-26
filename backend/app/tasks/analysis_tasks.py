"""
SpitKorean - 분석 태스크
비동기 데이터 분석 작업을 위한 Celery 태스크들을 정의합니다.
"""
from celery import shared_task
import json
from datetime import datetime, timedelta
from app.services.analytics_service import AnalyticsService
from app.utils.logger import LogManager

logger = LogManager().logger
analytics_service = AnalyticsService()

@shared_task
async def analyze_study_patterns(user_id):
    """
    사용자의 학습 패턴을 분석하여 통계 데이터 생성
    
    Args:
        user_id (str): 분석할 사용자 ID
        
    Returns:
        dict: 분석 결과 데이터
    """
    try:
        # 최근 30일 데이터 분석
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # 각 제품별 사용 패턴 분석
        talk_analysis = await analytics_service.analyze_product_usage(
            user_id, 'talk', start_date, end_date)
        
        drama_analysis = await analytics_service.analyze_product_usage(
            user_id, 'drama', start_date, end_date)
        
        test_analysis = await analytics_service.analyze_product_usage(
            user_id, 'test', start_date, end_date)
        
        journey_analysis = await analytics_service.analyze_product_usage(
            user_id, 'journey', start_date, end_date)
        
        # 시간대별 학습 패턴
        time_patterns = await analytics_service.analyze_time_patterns(
            user_id, start_date, end_date)
        
        # 주제별 학습 선호도
        topic_preferences = await analytics_service.analyze_topic_preferences(user_id)
        
        # 학습 효과 분석
        learning_effectiveness = await analytics_service.analyze_learning_effectiveness(user_id)
        
        # 결과 통합
        results = {
            "user_id": user_id,
            "analyzed_at": datetime.now().isoformat(),
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "product_usage": {
                "talk": talk_analysis,
                "drama": drama_analysis,
                "test": test_analysis,
                "journey": journey_analysis
            },
            "time_patterns": time_patterns,
            "topic_preferences": topic_preferences,
            "learning_effectiveness": learning_effectiveness
        }
        
        # 분석 결과 저장
        await analytics_service.save_analysis_results(user_id, results)
        
        return {
            "status": "success",
            "user_id": user_id,
            "results": results
        }
    except Exception as e:
        logger.error(f"Study pattern analysis failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "user_id": user_id
        }

@shared_task
async def generate_weekly_report(user_id):
    """
    사용자의 주간 학습 리포트 생성
    
    Args:
        user_id (str): 리포트를 생성할 사용자 ID
        
    Returns:
        dict: 생성된 리포트 데이터
    """
    try:
        # 최근 7일 데이터 분석
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # 주간 학습 통계
        weekly_stats = await analytics_service.get_weekly_stats(
            user_id, start_date, end_date)
        
        # 학습 목표 달성률
        goal_completion = await analytics_service.calculate_goal_completion(user_id)
        
        # 약점 분석
        weak_points = await analytics_service.identify_weak_points(user_id)
        
        # 강점 분석
        strong_points = await analytics_service.identify_strong_points(user_id)
        
        # 추천 학습 활동
        recommendations = await analytics_service.generate_recommendations(
            user_id, weak_points)
        
        # 다음 주 목표 제안
        suggested_goals = await analytics_service.suggest_goals(user_id)
        
        # 리포트 통합
        report = {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "weekly_stats": weekly_stats,
            "goal_completion": goal_completion,
            "weak_points": weak_points,
            "strong_points": strong_points,
            "recommendations": recommendations,
            "suggested_goals": suggested_goals
        }
        
        # 리포트 저장
        await analytics_service.save_weekly_report(user_id, report)
        
        return {
            "status": "success",
            "user_id": user_id,
            "report": report
        }
    except Exception as e:
        logger.error(f"Weekly report generation failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "user_id": user_id
        }

@shared_task
async def analyze_platform_metrics():
    """
    플랫폼 전체 성능 지표 분석
    
    Returns:
        dict: 분석된 지표 데이터
    """
    try:
        # 최근 30일 데이터 분석
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # 활성 사용자 분석
        active_users = await analytics_service.analyze_active_users(start_date, end_date)
        
        # 제품별 사용 통계
        product_usage = await analytics_service.analyze_product_distribution()
        
        # 유지율 분석
        retention = await analytics_service.analyze_retention(start_date, end_date)
        
        # 전환율 분석
        conversion = await analytics_service.analyze_conversion(start_date, end_date)
        
        # 평균 세션 시간
        session_time = await analytics_service.analyze_session_time(start_date, end_date)
        
        # 메트릭 통합
        metrics = {
            "analyzed_at": datetime.now().isoformat(),
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "active_users": active_users,
            "product_usage": product_usage,
            "retention": retention,
            "conversion": conversion,
            "session_time": session_time
        }
        
        # 메트릭 저장
        await analytics_service.save_platform_metrics(metrics)
        
        return {
            "status": "success",
            "metrics": metrics
        }
    except Exception as e:
        logger.error(f"Platform metrics analysis failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }
