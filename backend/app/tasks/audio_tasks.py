"""
SpitKorean - 오디오 처리 태스크
비동기 오디오 처리 작업을 위한 Celery 태스크들을 정의합니다.
"""
from celery import shared_task
import os
import tempfile
import subprocess
from app.services.whisper_service import WhisperService
from app.services.tts_service import TTSService
from app.utils.logger import LogManager

logger = LogManager().logger
whisper_service = WhisperService()
tts_service = TTSService()

@shared_task
async def process_audio_file(audio_file_path, user_id, session_id=None):
    """
    사용자가 업로드한 오디오 파일을 처리하여 텍스트로 변환
    
    Args:
        audio_file_path (str): 처리할 오디오 파일 경로
        user_id (str): 사용자 ID
        session_id (str, optional): 대화 세션 ID
        
    Returns:
        dict: 처리 결과 및 메타데이터
    """
    try:
        # 오디오 전처리 (노이즈 제거, 정규화)
        processed_path = await preprocess_audio(audio_file_path)
        
        # Whisper를 이용한 음성 인식
        transcription = await whisper_service.transcribe(processed_path)
        
        # 임시 파일 정리
        if os.path.exists(processed_path) and processed_path != audio_file_path:
            os.remove(processed_path)
            
        return {
            "status": "success",
            "transcription": transcription,
            "user_id": user_id,
            "session_id": session_id
        }
    except Exception as e:
        logger.error(f"Audio processing failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "user_id": user_id,
            "session_id": session_id
        }

@shared_task
async def generate_tts_response(text, voice_id, user_id, session_id=None):
    """
    텍스트를 음성으로 변환하여 오디오 파일 생성
    
    Args:
        text (str): 음성으로 변환할 텍스트
        voice_id (str): 사용할 음성 ID
        user_id (str): 사용자 ID
        session_id (str, optional): 대화 세션 ID
        
    Returns:
        dict: 생성된 오디오 파일 경로 및 메타데이터
    """
    try:
        audio_file_path = await tts_service.synthesize(text, voice_id)
        
        return {
            "status": "success",
            "audio_path": audio_file_path,
            "text": text,
            "user_id": user_id,
            "session_id": session_id
        }
    except Exception as e:
        logger.error(f"TTS generation failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "text": text,
            "user_id": user_id,
            "session_id": session_id
        }

async def preprocess_audio(audio_file_path):
    """
    오디오 파일을 전처리하여 인식 성능을 향상
    - 노이즈 제거
    - 볼륨 정규화
    - 샘플링 레이트 조정
    
    Args:
        audio_file_path (str): 원본 오디오 파일 경로
        
    Returns:
        str: 처리된 오디오 파일 경로
    """
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.close()
        
        # FFMPEG를 사용하여 오디오 전처리
        ffmpeg_cmd = [
            os.environ.get('FFMPEG_PATH', 'ffmpeg'),
            '-i', audio_file_path,
            '-af', 'highpass=f=200,lowpass=f=8000,afftdn=nf=-20,volume=1.5',
            '-ar', '16000',
            '-ac', '1',
            temp_file.name
        ]
        
        subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        return temp_file.name
    except Exception as e:
        logger.error(f"Audio preprocessing failed: {str(e)}")
        return audio_file_path  # 실패 시 원본 반환
