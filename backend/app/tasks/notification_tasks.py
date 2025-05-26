"""
SpitKorean - 알림 태스크
사용자 알림 전송을 위한 Celery 태스크들을 정의합니다.
"""
from celery import shared_task
import json
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from app.utils.logger import LogManager
from app.models.user import UserModel

logger = LogManager().logger
user_model = UserModel()

@shared_task
async def send_email_notification(user_id, subject, template_name, template_data):
    """
    사용자에게 이메일 알림을 전송
    
    Args:
        user_id (str): 알림을 받을 사용자 ID
        subject (str): 이메일 제목
        template_name (str): 사용할 템플릿 이름
        template_data (dict): 템플릿에 채울 데이터
        
    Returns:
        dict: 이메일 전송 결과
    """
    try:
        # 사용자 정보 조회
        user = await user_model.find_by_id(user_id)
        if not user:
            return {
                "status": "error",
                "error": "User not found",
                "user_id": user_id
            }
        
        recipient_email = user.get('email')
        recipient_name = user.get('profile', {}).get('name', 'Student')
        
        # 이메일 템플릿 로드
        template_path = f"app/templates/email/{template_name}.html"
        if not os.path.exists(template_path):
            template_path = f"app/templates/email/generic.html"
        
        with open(template_path, 'r', encoding='utf-8') as file:
            template_content = file.read()
        
        # 템플릿 데이터 적용
        template_data.update({
            "recipient_name": recipient_name,
            "current_year": datetime.now().year
        })
        
        for key, value in template_data.items():
            template_content = template_content.replace(f"{{{{{key}}}}}", str(value))
        
        # 이메일 구성
        msg = MIMEMultipart()
        msg['From'] = os.environ.get('EMAIL_ADDRESS')
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        # HTML 콘텐츠 추가
        msg.attach(MIMEText(template_content, 'html'))
        
        # 이메일 전송
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(
                os.environ.get('EMAIL_ADDRESS'),
                os.environ.get('EMAIL_APP_PASSWORD')
            )
            smtp.send_message(msg)
        
        # 알림 기록 저장
        notification_log = {
            "user_id": user_id,
            "type": "email",
            "subject": subject,
            "template": template_name,
            "sent_at": datetime.now().isoformat(),
            "status": "sent"
        }
        
        await user_model.add_notification_log(user_id, notification_log)
        
        return {
            "status": "success",
            "user_id": user_id,
            "email": recipient_email,
            "subject": subject
        }
    except Exception as e:
        logger.error(f"Email notification failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "user_id": user_id
        }

@shared_task
async def send_streak_reminder():
    """
    연속 학습 유지를 위한 리마인더 알림 전송
    활동이 없는 사용자들에게 알림을 보내어 학습 동기를 부여합니다.
    
    Returns:
        dict: 전송 결과 데이터
    """
    try:
        today = datetime.now()
        yesterday = today - timedelta(days=1)
        
        # 어제 활동이 있었지만 오늘 활동이 없는 사용자 검색
        users = await user_model.find_streak_at_risk()
        
        results = {
            "total": len(users),
            "succeeded": 0,
            "failed": 0,
            "failures": []
        }
        
        for user in users:
            user_id = user["_id"]
            streak_days = user.get("streak_days", 0)
            
            # 이메일 데이터 구성
            template_data = {
                "streak_days": streak_days,
                "next_achievement": streak_days + 1,
                "next_reward": get_next_streak_reward(streak_days + 1)
            }
            
            # 알림 전송
            result = await send_email_notification(
                user_id,
                f"Don't break your {streak_days}-day learning streak!",
                "streak_reminder",
                template_data
            )
            
            if result["status"] == "success":
                results["succeeded"] += 1
            else:
                results["failed"] += 1
                results["failures"].append({
                    "user_id": user_id,
                    "error": result.get("error")
                })
        
        return {
            "status": "success",
            "sent_at": datetime.now().isoformat(),
            "results": results
        }
    except Exception as e:
        logger.error(f"Streak reminder task failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

@shared_task
async def send_weekly_progress_report():
    """
    주간 학습 진행 보고서 전송
    
    Returns:
        dict: 전송 결과 데이터
    """
    try:
        # 지난 7일간 활동이 있는 사용자 검색
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        active_users = await user_model.find_active_users(start_date, end_date)
        
        results = {
            "total": len(active_users),
            "succeeded": 0,
            "failed": 0,
            "failures": []
        }
        
        for user in active_users:
            user_id = user["_id"]
            
            # 주간 분석 데이터 생성
            from app.tasks.analysis_tasks import generate_weekly_report
            report_data = await generate_weekly_report(user_id)
            
            if report_data["status"] != "success":
                results["failed"] += 1
                results["failures"].append({
                    "user_id": user_id,
                    "error": "Failed to generate report"
                })
                continue
                
            report = report_data["report"]
            
            # 이메일 데이터 구성
            template_data = {
                "report_data": report,
                "weekly_stats": report["weekly_stats"],
                "streak_days": user.get("streak_days", 0),
                "progress_chart_url": f"https://spitkorean.com/api/chart/progress/{user_id}"
            }
            
            # 알림 전송
            result = await send_email_notification(
                user_id,
                "Your Weekly Korean Learning Progress",
                "weekly_report",
                template_data
            )
            
            if result["status"] == "success":
                results["succeeded"] += 1
            else:
                results["failed"] += 1
                results["failures"].append({
                    "user_id": user_id,
                    "error": result.get("error")
                })
        
        return {
            "status": "success",
            "sent_at": datetime.now().isoformat(),
            "results": results
        }
    except Exception as e:
        logger.error(f"Weekly progress report task failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

def get_next_streak_reward(streak_days):
    """
    다음 연속 학습 보상 정보 반환
    
    Args:
        streak_days (int): 현재 연속 학습 일수
        
    Returns:
        str: 다음 보상 설명
    """
    if streak_days < 7:
        return f"{7 - streak_days}일 더 학습하면 프리미엄 이모티콘 세트가 해제됩니다!"
    elif streak_days < 30:
        return f"{30 - streak_days}일 더 학습하면 한국 간식 박스가 배송됩니다!"
    elif streak_days < 100:
        return f"{100 - streak_days}일 더 학습하면 온라인 수료증과 굿즈가 제공됩니다!"
    else:
        return "대단해요! 100일 연속 학습을 달성했습니다!"
