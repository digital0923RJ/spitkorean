import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Mic, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Settings,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// 훅 import
import { useChat } from '../../hooks/useChat';
import { useVoice } from '../../hooks/useVoice';

// 컴포넌트 import
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import MessageBubble from './MessageBubble';
import VoiceRecorder from './VoiceRecorder';
import EmotionIndicator from './EmotionIndicator';

const ChatInterface = ({ 
  className = '',
  sessionId = null, // 특정 세션 로드용
  onSessionChange = null // 세션 변경 콜백
}) => {
  // Chat 훅 사용
  const {
    // 상태
    currentSession,
    messages,
    usage,
    settings,
    inputMessage,
    isLoading,
    hasUsageLeft,
    connectionStatus,
    
    // 액션들
    sendTextMessage,
    sendVoiceMessage,
    startNewChat,
    loadExistingSession,
    updateChatSettings,
    handleInputChange,
    handleKeyPress,
    scrollToBottom,
    toggleMute,
    retryLastMessage,
    
    // 유틸리티
    getSessionStats,
    messagesEndRef,
    inputRef,
    
    // 상수 및 계산된 값
    MAX_MESSAGE_LENGTH,
    canSendMessage,
    messageProgress,
    isConnected,
    sessionStats
  } = useChat();

  // Voice 훅 사용
  const {
    // 상태
    isRecording,
    isProcessing,
    isPlayingTTS,
    audioLevel,
    recordingDuration,
    isSupported: voiceSupported,
    errorMessage: voiceError,
    voiceSettings,
    
    // 액션들
    startRecording,
    stopRecording,
    playTTS,
    stopTTS,
    analyzePronunciationAudio,
    updateVoiceSettings,
    testMicrophone,
    
    // 계산된 값
    recordingProgress,
    formattedDuration,
    canRecord,
    canPlayTTS,
    audioLevelPercent
  } = useVoice();

  // 로컬 상태
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // 레퍼런스
  const textareaRef = useRef(null);

  // 레벨별 설정
  const levelConfigs = {
    beginner: {
      placeholder: "안녕하세요! Hello! 간단한 한국어로 이야기해보세요... 😊",
      helpText: "한국어 30% + 영어 70% • 천천히 대화하기",
      maxLength: 100,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800"
    },
    intermediate: {
      placeholder: "안녕하세요! 편하게 한국어로 대화해보세요... 💫",
      helpText: "한국어 70% + 영어 30% • 자연스러운 대화",
      maxLength: 200,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800"
    },
    advanced: {
      placeholder: "안녕하세요! 깊이 있는 주제로 대화해봅시다... 🌟",
      helpText: "한국어 95% + 영어 5% • 고급 표현 활용",
      maxLength: 300,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800"
    }
  };

  const config = levelConfigs[settings.level] || levelConfigs.beginner;

  // 특정 세션 로드 (prop으로 전달된 경우)
  useEffect(() => {
    if (sessionId && sessionId !== currentSession?.sessionId) {
      loadExistingSession(sessionId);
    }
  }, [sessionId, currentSession?.sessionId, loadExistingSession]);

  // 세션 변경 알림
  useEffect(() => {
    if (onSessionChange && currentSession) {
      onSessionChange(currentSession);
    }
  }, [currentSession, onSessionChange]);

  // 메시지 전송 처리
  const handleSendMessage = useCallback(async () => {
    if (!canSendMessage) return;

    const success = await sendTextMessage();
    if (success && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [canSendMessage, sendTextMessage]);

  // 음성 메시지 처리 (통합)
  const handleVoiceMessage = useCallback(async (audioBlob) => {
    if (!audioBlob || !hasUsageLeft) {
      toast.error('음성 메시지를 처리할 수 없습니다.');
      return;
    }

    try {
      // 1. 음성 → 텍스트 변환 및 분석
      const analysisResult = await analyzePronunciationAudio(
        audioBlob, 
        "음성 메시지", 
        settings.level
      );

      if (analysisResult && analysisResult.transcribedText) {
        // 2. 인식된 텍스트로 메시지 전송
        await sendVoiceMessage(audioBlob);
        
        // 3. 발음 분석 결과 표시
        if (analysisResult.score >= 70) {
          toast.success(`발음 점수: ${analysisResult.score}점! 👏`);
        } else {
          toast(`발음 점수: ${analysisResult.score}점`, {
            icon: '💪',
            duration: 3000
          });
        }
      } else {
        throw new Error('음성 인식에 실패했습니다.');
      }
    } catch (error) {
      console.error('음성 메시지 처리 오류:', error);
      toast.error('음성 메시지 처리에 실패했습니다.');
    }
  }, [hasUsageLeft, analyzePronunciationAudio, sendVoiceMessage, settings.level]);

  // 텍스트 영역 자동 크기 조절
  const handleTextareaChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= config.maxLength) {
      handleInputChange(value);
      
      // 자동 높이 조절
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [config.maxLength, handleInputChange]);

  // 대화 초기화
  const handleResetChat = useCallback(() => {
    if (window.confirm('현재 대화를 초기화하시겠습니까?')) {
      startNewChat();
    }
  }, [startNewChat]);

  // TTS 재생 처리
  const handlePlayTTS = useCallback(async (text) => {
    if (!settings.isMuted && canPlayTTS) {
      await playTTS(text, {
        voiceGender: voiceSettings.ttsVoiceGender,
        speed: voiceSettings.ttsSpeed
      });
    }
  }, [settings.isMuted, canPlayTTS, playTTS, voiceSettings]);

  // 레벨 변경 처리
  const handleLevelChange = useCallback((newLevel) => {
    updateChatSettings({ level: newLevel });
    updateVoiceSettings({ 
      pronunciationThreshold: newLevel === 'advanced' ? 80 : 70 
    });
  }, [updateChatSettings, updateVoiceSettings]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      
      {/* 상단 상태 바 */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* 연결 상태 */}
            <div className={`flex items-center space-x-2 ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium">
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>

            {/* 세션 정보 */}
            <div className="text-xs text-gray-500">
              세션: {currentSession?.sessionId?.slice(-8) || 'N/A'}
            </div>

            {/* 사용량 */}
            <div className="text-xs text-gray-500">
              남은 횟수: {usage?.remaining || 0}/{usage?.daily_limit || 60}
            </div>
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className={`${settings.isMuted ? 'text-red-500' : 'text-gray-600'}`}
              title={settings.isMuted ? '음성 켜기' : '음성 끄기'}
            >
              {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="text-gray-600"
              title="고급 설정"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetChat}
              className="text-gray-600"
              title="새 대화 시작"
              disabled={messages.length === 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 고급 컨트롤 패널 */}
        {showAdvancedControls && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-3 gap-4 text-xs">
              {/* 레벨 선택 */}
              <div>
                <label className="block text-gray-600 mb-1">학습 레벨</label>
                <select
                  value={settings.level}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
              </div>

              {/* 음성 설정 */}
              <div>
                <label className="block text-gray-600 mb-1">음성 성별</label>
                <select
                  value={voiceSettings.ttsVoiceGender}
                  onChange={(e) => updateVoiceSettings({ ttsVoiceGender: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                </select>
              </div>

              {/* 음성 속도 */}
              <div>
                <label className="block text-gray-600 mb-1">
                  음성 속도: {voiceSettings.ttsSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSettings.ttsSpeed}
                  onChange={(e) => updateVoiceSettings({ ttsSpeed: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 레벨 안내 (첫 메시지가 없을 때만) */}
        {messages.length === 0 && (
          <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full bg-current`} />
              <span className={`text-sm font-medium ${config.textColor}`}>
                {settings.level.charAt(0).toUpperCase() + settings.level.slice(1)} 레벨 대화
              </span>
              {!hasUsageLeft && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                  사용량 초과
                </span>
              )}
            </div>
            <p className={`text-sm ${config.textColor}`}>
              {config.helpText}
            </p>
            {voiceSupported && (
              <p className="text-xs text-gray-500 mt-2">
                🎤 음성 입력 지원 • 📢 TTS 재생 가능
              </p>
            )}
          </div>
        )}

        {/* 음성 에러 메시지 */}
        {voiceError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-800 text-sm">{voiceError}</span>
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.timestamp}-${index}`}
            message={message}
            isUser={message.role === 'user'}
            onSpeak={handlePlayTTS}
            showSpeakButton={!settings.isMuted && canPlayTTS}
            isPlayingTTS={isPlayingTTS}
          />
        ))}

        {/* 타이핑/처리 인디케이터 */}
        {(isLoading || isProcessing) && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg p-3 shadow-sm max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500">
                  {isProcessing ? '음성 처리 중...' : 'AI가 생각 중...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t p-4">
        
        {/* 상단 컨트롤 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <EmotionIndicator 
              emotion={messages[messages.length - 1]?.emotion}
              size="sm"
            />
            <span className="text-xs text-gray-500">
              메시지: {sessionStats.messageCount}개 • {sessionStats.sessionDuration}분
            </span>
            {sessionStats.dominantEmotion && (
              <span className="text-xs text-blue-500">
                주요 감정: {sessionStats.dominantEmotion}
              </span>
            )}
          </div>
          
          {/* 음성 레벨 표시 (녹음 중일 때) */}
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-150"
                  style={{ width: `${audioLevelPercent}%` }}
                />
              </div>
              <span className="text-xs text-red-600 font-mono">
                {formattedDuration}
              </span>
            </div>
          )}
        </div>

        {/* 입력 폼 */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              rows="1"
              style={{ 
                minHeight: '48px', 
                maxHeight: '120px',
                lineHeight: '1.5'
              }}
              disabled={isLoading || !hasUsageLeft}
              maxLength={config.maxLength}
            />
            
            {/* 글자 수 카운터 */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              <span className={messageProgress > 90 ? 'text-red-500' : ''}>
                {inputMessage.length}/{config.maxLength}
              </span>
            </div>

            {/* 메시지 진행률 바 */}
            {messageProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5">
                <div 
                  className={`h-full transition-all duration-200 ${
                    messageProgress > 90 ? 'bg-red-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${messageProgress}%` }}
                />
              </div>
            )}
          </div>
          
          {/* 음성 녹음 버튼 */}
          <VoiceRecorder
            onVoiceMessage={handleVoiceMessage}
            onRecordingChange={(recording) => {
              // 녹음 상태는 useVoice에서 관리되므로 추가 처리 불필요
            }}
            disabled={isLoading || !hasUsageLeft || !voiceSupported}
            isRecording={isRecording}
            audioLevel={audioLevel}
            className={`${isRecording ? 'animate-pulse ring-2 ring-red-400' : ''}`}
          />
          
          {/* 전송 버튼 */}
          <Button
            onClick={handleSendMessage}
            disabled={!canSendMessage}
            className={`p-3 transition-all duration-200 ${
              canSendMessage 
                ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="메시지 전송 (Enter)"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* 힌트 텍스트 */}
        <div className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center space-x-4 flex-wrap">
          <span>Enter로 전송</span>
          <span>•</span>
          <span>Shift+Enter로 줄바꿈</span>
          {voiceSupported && (
            <>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Mic className="w-3 h-3" />
                <span>음성 입력</span>
              </span>
            </>
          )}
          {!hasUsageLeft && (
            <>
              <span>•</span>
              <span className="text-red-500">사용량 초과</span>
            </>
          )}
        </div>

        {/* 레벨별 도움말 */}
        <div className="text-xs text-gray-400 mt-1 text-center">
          {config.helpText}
          {!isConnected && (
            <span className="text-red-500 ml-2">• 연결 확인 중...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;