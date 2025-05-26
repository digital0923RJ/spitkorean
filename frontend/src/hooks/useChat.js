// frontend/src/hooks/useChat.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Redux 액션들
import {
  sendMessage,
  processVoiceMessage,
  loadSessions,
  loadSession,
  loadUsage,
  startNewSession,
  updateSettings,
  setMuted,
  setRecording,
  addTempMessage,
  clearErrors,
  // 셀렉터들
  selectCurrentSession,
  selectMessages,
  selectSessions,
  selectUsage,
  selectSettings,
  selectStats,
  selectEmotionHistory,
  selectIsLoading,
  selectHasUsageLeft
} from '@store/slices/talkSlice';

// 게임화 액션들
import { updateXP, updateStreak } from '@store/slices/gamificationSlice';

// 피드백 액션들
import { generateChatFeedback } from '@store/slices/feedbackSlice';

// 사용자 정보
import { selectUser } from '@store/slices/authSlice';

/**
 * Talk Like You Mean It 채팅 훅
 * 대화 기능, 음성 처리, 감정 분석, 게임화, 피드백을 통합 관리
 */
const useChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux 상태 선택
  const currentSession = useSelector(selectCurrentSession);
  const messages = useSelector(selectMessages);
  const sessions = useSelector(selectSessions);
  const usage = useSelector(selectUsage);
  const settings = useSelector(selectSettings);
  const stats = useSelector(selectStats);
  const emotionHistory = useSelector(selectEmotionHistory);
  const isLoading = useSelector(selectIsLoading);
  const hasUsageLeft = useSelector(selectHasUsageLeft);
  const user = useSelector(selectUser);

  // 로컬 상태
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmotionIndicator, setShowEmotionIndicator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // 상수
  const MAX_MESSAGE_LENGTH = 500;
  const TYPING_TIMEOUT = 1000;
  const MAX_RETRY_COUNT = 3;
  const RETRY_DELAY = 2000;

  // 메시지 전송
  const sendTextMessage = useCallback(async (message = inputMessage) => {
    if (!message.trim()) {
      toast.error('메시지를 입력해주세요.');
      return false;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      toast.error(`메시지는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`);
      return false;
    }

    if (!hasUsageLeft) {
      toast.error('오늘의 사용량을 모두 소진했습니다.');
      return false;
    }

    try {
      setInputMessage('');
      setIsTyping(false);

      const result = await dispatch(sendMessage({
        message: message.trim(),
        sessionId: currentSession.sessionId,
        level: settings.level
      })).unwrap();

      // 성공 시 게임화 업데이트
      await Promise.all([
        dispatch(updateXP({ 
          activity: 'talk_chat', 
          amount: 10,
          metadata: { level: settings.level }
        })),
        dispatch(updateStreak())
      ]);

      // 피드백 생성 (설정에 따라)
      if (settings.enableFeedback && result.aiResponse) {
        await dispatch(generateChatFeedback({
          userMessage: message,
          aiResponse: result.aiResponse.content,
          userLevel: settings.level,
          nativeLanguage: user?.profile?.nativeLanguage || 'en',
          emotionData: result.aiResponse.emotion
        }));
      }

      setRetryCount(0);
      scrollToBottom();
      
      return true;
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      
      if (retryCount < MAX_RETRY_COUNT) {
        setRetryCount(prev => prev + 1);
        toast.error(`전송 실패. ${MAX_RETRY_COUNT - retryCount}회 재시도 가능합니다.`);
      } else {
        toast.error('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      return false;
    }
  }, [inputMessage, hasUsageLeft, currentSession.sessionId, settings, user, dispatch, retryCount]);

  // 음성 메시지 전송
  const sendVoiceMessage = useCallback(async (audioBlob) => {
    if (!audioBlob) {
      toast.error('음성 데이터가 없습니다.');
      return false;
    }

    if (!hasUsageLeft) {
      toast.error('오늘의 사용량을 모두 소진했습니다.');
      return false;
    }

    try {
      const result = await dispatch(processVoiceMessage({
        audioBlob,
        sessionId: currentSession.sessionId,
        level: settings.level
      })).unwrap();

      // 게임화 업데이트 (음성 메시지는 추가 보너스)
      await Promise.all([
        dispatch(updateXP({ 
          activity: 'voice_chat', 
          amount: 15,
          metadata: { level: settings.level }
        })),
        dispatch(updateStreak())
      ]);

      scrollToBottom();
      return true;
    } catch (error) {
      console.error('음성 메시지 전송 오류:', error);
      toast.error('음성 메시지 전송에 실패했습니다.');
      return false;
    }
  }, [hasUsageLeft, currentSession.sessionId, settings.level, dispatch]);

  // 새 세션 시작
  const startNewChat = useCallback(() => {
    dispatch(startNewSession());
    setInputMessage('');
    setIsTyping(false);
    setRetryCount(0);
    
    toast.success('새로운 대화가 시작되었습니다! 🎉');
  }, [dispatch]);

  // 기존 세션 로드
  const loadExistingSession = useCallback(async (sessionId) => {
    try {
      await dispatch(loadSession({ sessionId })).unwrap();
      scrollToBottom();
      toast.success('이전 대화를 불러왔습니다.');
    } catch (error) {
      console.error('세션 로드 오류:', error);
      toast.error('대화를 불러오는데 실패했습니다.');
    }
  }, [dispatch]);

  // 세션 목록 새로고침
  const refreshSessions = useCallback(async () => {
    try {
      await dispatch(loadSessions()).unwrap();
    } catch (error) {
      console.error('세션 목록 새로고침 오류:', error);
      toast.error('세션 목록을 불러오는데 실패했습니다.');
    }
  }, [dispatch]);

  // 사용량 새로고침
  const refreshUsage = useCallback(async () => {
    try {
      await dispatch(loadUsage()).unwrap();
    } catch (error) {
      console.error('사용량 새로고침 오류:', error);
    }
  }, [dispatch]);

  // 설정 업데이트
  const updateChatSettings = useCallback((newSettings) => {
    dispatch(updateSettings(newSettings));
    
    if (newSettings.level) {
      toast.success(`학습 레벨이 ${newSettings.level}(으)로 변경되었습니다.`);
    }
  }, [dispatch]);

  // 타이핑 상태 관리
  const handleInputChange = useCallback((value) => {
    setInputMessage(value);
    
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // 타이핑 타임아웃 리셋
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, TYPING_TIMEOUT);
  }, [isTyping]);

  // 엔터 키 처리
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && inputMessage.trim()) {
        sendTextMessage();
      }
    }
  }, [isLoading, inputMessage, sendTextMessage]);

  // 메시지 영역 스크롤
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  }, []);

  // 감정 표시기 토글
  const toggleEmotionIndicator = useCallback(() => {
    setShowEmotionIndicator(prev => !prev);
  }, []);

  // 음성 녹음 상태 관리
  const toggleRecording = useCallback((isRecording) => {
    dispatch(setRecording(isRecording));
  }, [dispatch]);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    dispatch(setMuted(!settings.isMuted));
  }, [dispatch, settings.isMuted]);

  // 재시도 함수
  const retryLastMessage = useCallback(async () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      
      if (lastUserMessage) {
        await sendTextMessage(lastUserMessage.content);
      }
    }
  }, [messages, sendTextMessage]);

  // 연결 상태 확인
  const checkConnection = useCallback(async () => {
    try {
      await dispatch(loadUsage()).unwrap();
      setConnectionStatus('connected');
      setRetryCount(0);
    } catch (error) {
      setConnectionStatus('disconnected');
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        checkConnection();
      }, RETRY_DELAY * (retryCount + 1));
    }
  }, [dispatch, retryCount]);

  // 임시 메시지 추가 (즉시 UI 반영용)
  const addTemporaryMessage = useCallback((message) => {
    const tempMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      isTemporary: true
    };
    
    dispatch(addTempMessage(tempMessage));
  }, [dispatch]);

  // 통계 데이터 가공
  const getSessionStats = useCallback(() => {
    const userMessages = messages.filter(msg => msg.role === 'user').length;
    const averageMessageLength = messages
      .filter(msg => msg.role === 'user')
      .reduce((sum, msg) => sum + msg.content.length, 0) / Math.max(userMessages, 1);
    
    const recentEmotions = emotionHistory.slice(-5);
    const dominantEmotion = recentEmotions.length > 0 
      ? recentEmotions.reduce((prev, current) => 
          prev.confidence > current.confidence ? prev : current
        ).emotion
      : null;

    return {
      messageCount: userMessages,
      averageMessageLength: Math.round(averageMessageLength),
      sessionDuration: currentSession.createdAt 
        ? Math.round((Date.now() - new Date(currentSession.createdAt).getTime()) / 1000 / 60)
        : 0,
      dominantEmotion,
      emotionVariety: [...new Set(emotionHistory.map(e => e.emotion))].length
    };
  }, [messages, emotionHistory, currentSession.createdAt]);

  // 초기화 및 정리
  useEffect(() => {
    // 컴포넌트 마운트 시 초기 데이터 로드
    dispatch(loadUsage());
    dispatch(loadSessions());
    
    return () => {
      // 정리
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // 메시지 변경 시 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 연결 상태 모니터링
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000); // 30초마다 체크
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    // 상태
    currentSession,
    messages,
    sessions,
    usage,
    settings,
    stats,
    emotionHistory,
    inputMessage,
    isLoading,
    isTyping,
    hasUsageLeft,
    showEmotionIndicator,
    connectionStatus,
    retryCount,
    
    // 액션들
    sendTextMessage,
    sendVoiceMessage,
    startNewChat,
    loadExistingSession,
    refreshSessions,
    refreshUsage,
    updateChatSettings,
    handleInputChange,
    handleKeyPress,
    scrollToBottom,
    toggleEmotionIndicator,
    toggleRecording,
    toggleMute,
    retryLastMessage,
    addTemporaryMessage,
    
    // 유틸리티
    getSessionStats,
    
    // refs
    messagesEndRef,
    inputRef,
    
    // 상수
    MAX_MESSAGE_LENGTH,
    
    // 계산된 값들
    canSendMessage: !isLoading && hasUsageLeft && inputMessage.trim().length > 0,
    messageProgress: Math.min((inputMessage.length / MAX_MESSAGE_LENGTH) * 100, 100),
    isConnected: connectionStatus === 'connected',
    sessionStats: getSessionStats()
  };
};

export default useChat;