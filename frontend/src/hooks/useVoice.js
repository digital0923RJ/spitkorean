// frontend/src/hooks/useVoice.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// Redux 액션들
import { setRecording, setMuted } from '@store/slices/talkSlice';
import { analyzePronunciation } from '@store/slices/feedbackSlice';

// 사용자 정보
import { selectUser } from '@store/slices/authSlice';

/**
 * 음성 처리 통합 훅
 * WebRTC 녹음, Whisper 인식, TTS 재생, 발음 분석을 통합 관리
 * Talk Like You Mean It, Korean Journey 등에서 공용 사용
 */
const useVoice = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // 로컬 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // 설정
  const [voiceSettings, setVoiceSettings] = useState({
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    ttsVoiceGender: 'female', // female, male
    ttsSpeed: 1.0, // 0.5 ~ 2.0
    ttsPitch: 0.0, // -20.0 ~ 20.0
    autoPlayTTS: false,
    recordingFormat: 'webm', // webm, mp4, wav
    maxRecordingTime: 60000, // 60초
    minRecordingTime: 1000, // 1초
    pronunciationThreshold: 70 // 발음 점수 임계값
  });

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const ttsAudioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const levelCheckIntervalRef = useRef(null);

  // 브라우저 지원 확인
  const checkBrowserSupport = useCallback(() => {
    const supported = {
      mediaRecorder: typeof MediaRecorder !== 'undefined',
      getUserMedia: navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
      audioContext: typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined',
      speechSynthesis: 'speechSynthesis' in window
    };

    const isFullySupported = Object.values(supported).every(Boolean);
    setIsSupported(isFullySupported);

    if (!isFullySupported) {
      const missing = Object.entries(supported)
        .filter(([_, isSupported]) => !isSupported)
        .map(([feature]) => feature);
      
      setErrorMessage(`브라우저가 다음 기능을 지원하지 않습니다: ${missing.join(', ')}`);
    }

    // 지원되는 MIME 타입 확인
    const formats = ['webm', 'mp4', 'wav'].filter(format => {
      const mimeTypes = {
        webm: ['audio/webm', 'audio/webm;codecs=opus'],
        mp4: ['audio/mp4', 'audio/mp4;codecs=mp4a.40.2'],
        wav: ['audio/wav', 'audio/wave']
      };
      
      return mimeTypes[format].some(mimeType => 
        MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mimeType)
      );
    });

    setSupportedFormats(formats);
    
    return isFullySupported;
  }, []);

  // 마이크 권한 요청
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: voiceSettings.sampleRate,
          channelCount: voiceSettings.channelCount,
          echoCancellation: voiceSettings.echoCancellation,
          noiseSuppression: voiceSettings.noiseSuppression,
          autoGainControl: voiceSettings.autoGainControl
        }
      });

      // 권한 획득 후 즉시 스트림 해제
      stream.getTracks().forEach(track => track.stop());
      
      toast.success('마이크 권한이 허용되었습니다.');
      return true;
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error);
      
      let errorMsg = '마이크 권한을 허용해주세요.';
      if (error.name === 'NotFoundError') {
        errorMsg = '마이크를 찾을 수 없습니다.';
      } else if (error.name === 'NotAllowedError') {
        errorMsg = '마이크 권한이 거부되었습니다.';
      } else if (error.name === 'NotReadableError') {
        errorMsg = '마이크가 사용 중입니다.';
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  }, [voiceSettings]);

  // 오디오 레벨 모니터링 시작
  const startAudioLevelMonitoring = useCallback((stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // 평균 볼륨 계산
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          
          setAudioLevel(normalizedLevel);
          
          levelCheckIntervalRef.current = requestAnimationFrame(checkLevel);
        }
      };
      
      checkLevel();
    } catch (error) {
      console.error('오디오 레벨 모니터링 시작 실패:', error);
    }
  }, [isRecording]);

  // 오디오 레벨 모니터링 중지
  const stopAudioLevelMonitoring = useCallback(() => {
    if (levelCheckIntervalRef.current) {
      cancelAnimationFrame(levelCheckIntervalRef.current);
      levelCheckIntervalRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
  }, []);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      toast.error('브라우저에서 음성 녹음을 지원하지 않습니다.');
      return false;
    }

    if (isRecording) {
      toast.warn('이미 녹음 중입니다.');
      return false;
    }

    try {
      setErrorMessage(null);
      setIsRecording(true);
      dispatch(setRecording(true));

      // 마이크 스트림 획득
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: voiceSettings.sampleRate,
          channelCount: voiceSettings.channelCount,
          echoCancellation: voiceSettings.echoCancellation,
          noiseSuppression: voiceSettings.noiseSuppression,
          autoGainControl: voiceSettings.autoGainControl
        }
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // MIME 타입 결정
      const format = voiceSettings.recordingFormat;
      const mimeTypes = {
        webm: ['audio/webm;codecs=opus', 'audio/webm'],
        mp4: ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4'],
        wav: ['audio/wav', 'audio/wave']
      };

      let selectedMimeType = null;
      for (const mimeType of mimeTypes[format] || []) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error(`${format} 형식을 지원하지 않습니다.`);
      }

      // MediaRecorder 설정
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });

      // 이벤트 리스너
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
        dispatch(setRecording(false));
        
        // 스트림 정리
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
        
        stopAudioLevelMonitoring();
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        setRecordingDuration(0);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder 오류:', event.error);
        toast.error('녹음 중 오류가 발생했습니다.');
        stopRecording();
      };

      // 녹음 시작
      mediaRecorderRef.current.start(100); // 100ms마다 데이터 수집

      // 오디오 레벨 모니터링 시작
      startAudioLevelMonitoring(stream);

      // 녹음 시간 타이머
      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        const duration = Date.now() - startTime;
        setRecordingDuration(duration);
        
        // 최대 녹음 시간 체크
        if (duration >= voiceSettings.maxRecordingTime) {
          stopRecording();
          toast.warn(`최대 녹음 시간(${voiceSettings.maxRecordingTime / 1000}초)에 도달했습니다.`);
        }
      }, 100);

      toast.success('녹음이 시작되었습니다.');
      return true;
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      setIsRecording(false);
      dispatch(setRecording(false));
      
      let errorMsg = '녹음을 시작할 수 없습니다.';
      if (error.name === 'NotAllowedError') {
        errorMsg = '마이크 권한을 허용해주세요.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = '마이크를 찾을 수 없습니다.';
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  }, [isSupported, isRecording, voiceSettings, dispatch, startAudioLevelMonitoring, stopAudioLevelMonitoring]);

  // 녹음 중지
  const stopRecording = useCallback(async () => {
    if (!isRecording || !mediaRecorderRef.current) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const originalOnStop = mediaRecorderRef.current.onstop;
      
      mediaRecorderRef.current.onstop = async (event) => {
        // 원래 onstop 핸들러 실행
        if (originalOnStop) {
          originalOnStop(event);
        }

        try {
          // 녹음 시간 체크
          if (recordingDuration < voiceSettings.minRecordingTime) {
            toast.warn(`최소 ${voiceSettings.minRecordingTime / 1000}초 이상 녹음해주세요.`);
            resolve(null);
            return;
          }

          // 오디오 Blob 생성
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current.mimeType
          });

          if (audioBlob.size === 0) {
            throw new Error('녹음된 데이터가 없습니다.');
          }

          toast.success(`녹음 완료 (${Math.round(recordingDuration / 1000)}초)`);
          resolve(audioBlob);
        } catch (error) {
          console.error('녹음 완료 처리 실패:', error);
          toast.error('녹음 완료 처리에 실패했습니다.');
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording, recordingDuration, voiceSettings.minRecordingTime]);

  // TTS 음성 재생
  const playTTS = useCallback(async (text, options = {}) => {
    if (!text || !text.trim()) {
      toast.error('재생할 텍스트가 없습니다.');
      return false;
    }

    if (isPlayingTTS) {
      toast.warn('이미 음성이 재생 중입니다.');
      return false;
    }

    try {
      setIsPlayingTTS(true);

      // 백엔드 TTS API 호출 (tts_service.py와 연동)
      const response = await fetch('/api/v1/common/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_gender: options.voiceGender || voiceSettings.ttsVoiceGender,
          speed: options.speed || voiceSettings.ttsSpeed,
          pitch: options.pitch || voiceSettings.ttsPitch,
          language: 'ko-KR'
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API 오류: ${response.status}`);
      }

      const audioArrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // 오디오 재생
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        URL.revokeObjectURL(ttsAudioRef.current.src);
      }

      ttsAudioRef.current = new Audio(audioUrl);
      
      ttsAudioRef.current.onended = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
      };

      ttsAudioRef.current.onerror = (error) => {
        console.error('TTS 재생 오류:', error);
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
        toast.error('음성 재생에 실패했습니다.');
      };

      await ttsAudioRef.current.play();
      return true;
    } catch (error) {
      console.error('TTS 재생 실패:', error);
      setIsPlayingTTS(false);
      toast.error('음성 재생에 실패했습니다.');
      return false;
    }
  }, [isPlayingTTS, voiceSettings]);

  // TTS 재생 중지
  const stopTTS = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      setIsPlayingTTS(false);
    }
  }, []);

  // 발음 분석 (Korean Journey, Talk에서 사용)
  const analyzePronunciationAudio = useCallback(async (audioBlob, originalText, level = 'beginner') => {
    if (!audioBlob || !originalText) {
      toast.error('분석할 데이터가 없습니다.');
      return null;
    }

    try {
      setIsProcessing(true);

      // 백엔드 발음 분석 API 호출 (whisper_service.py와 연동)
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('original_text', originalText);
      formData.append('level', level);

      const response = await fetch('/api/v1/journey/pronunciation-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`발음 분석 API 오류: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const analysisData = result.data;

        // Redux에 발음 분석 결과 저장
        await dispatch(analyzePronunciation({
          originalText,
          transcribedText: analysisData.transcribed_text,
          pronunciationScore: analysisData.pronunciation_score,
          level,
          nativeLanguage: user?.profile?.nativeLanguage || 'en'
        })).unwrap();

        // 발음 점수에 따른 피드백
        if (analysisData.pronunciation_score >= voiceSettings.pronunciationThreshold) {
          toast.success(`훌륭한 발음입니다! (${analysisData.pronunciation_score}점)`);
        } else {
          toast(`발음을 개선해보세요. (${analysisData.pronunciation_score}점)`, {
            icon: '💪',
            duration: 3000
          });
        }

        return {
          score: analysisData.pronunciation_score,
          transcribedText: analysisData.transcribed_text,
          analysis: analysisData.detailed_analysis,
          improvements: analysisData.improvement_suggestions
        };
      } else {
        throw new Error(result.message || '발음 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('발음 분석 실패:', error);
      toast.error('발음 분석에 실패했습니다.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user, voiceSettings.pronunciationThreshold]);

  // 음성 설정 업데이트
  const updateVoiceSettings = useCallback((newSettings) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
    
    if (newSettings.ttsVoiceGender) {
      toast.success(`음성 성별이 ${newSettings.ttsVoiceGender === 'female' ? '여성' : '남성'}으로 변경되었습니다.`);
    }
  }, []);

  // 음성 설정 초기화
  const resetVoiceSettings = useCallback(() => {
    setVoiceSettings({
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      ttsVoiceGender: 'female',
      ttsSpeed: 1.0,
      ttsPitch: 0.0,
      autoPlayTTS: false,
      recordingFormat: 'webm',
      maxRecordingTime: 60000,
      minRecordingTime: 1000,
      pronunciationThreshold: 70
    });
    
    toast.success('음성 설정이 초기화되었습니다.');
  }, []);

  // 마이크 테스트
  const testMicrophone = useCallback(async () => {
    try {
      toast.loading('마이크를 테스트하는 중...');
      
      const success = await startRecording();
      if (success) {
        // 3초 후 자동 중지
        setTimeout(async () => {
          const audioBlob = await stopRecording();
          if (audioBlob) {
            toast.success('마이크가 정상적으로 작동합니다!');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('마이크 테스트 실패:', error);
      toast.error('마이크 테스트에 실패했습니다.');
    }
  }, [startRecording, stopRecording]);

  // 초기화 및 정리
  useEffect(() => {
    checkBrowserSupport();

    return () => {
      // 정리 작업
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        if (ttsAudioRef.current.src) {
          URL.revokeObjectURL(ttsAudioRef.current.src);
        }
      }
      
      stopAudioLevelMonitoring();
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      setIsRecording(false);
      dispatch(setRecording(false));
    };
  }, [checkBrowserSupport, isRecording, dispatch, stopAudioLevelMonitoring]);

  return {
    // 상태
    isRecording,
    isProcessing,
    isPlayingTTS,
    audioLevel,
    recordingDuration,
    supportedFormats,
    isSupported,
    errorMessage,
    voiceSettings,
    
    // 녹음 관련
    startRecording,
    stopRecording,
    requestMicrophonePermission,
    testMicrophone,
    
    // TTS 관련
    playTTS,
    stopTTS,
    
    // 발음 분석
    analyzePronunciationAudio,
    
    // 설정 관리
    updateVoiceSettings,
    resetVoiceSettings,
    
    // 유틸리티
    checkBrowserSupport,
    
    // 계산된 값들
    recordingProgress: Math.min((recordingDuration / voiceSettings.maxRecordingTime) * 100, 100),
    formattedDuration: `${Math.floor(recordingDuration / 1000)}:${String(Math.floor((recordingDuration % 1000) / 10)).padStart(2, '0')}`,
    canRecord: isSupported && !isRecording && !isProcessing,
    canPlayTTS: isSupported && !isPlayingTTS,
    audioLevelPercent: Math.round(audioLevel * 100)
  };
};

export default useVoice;