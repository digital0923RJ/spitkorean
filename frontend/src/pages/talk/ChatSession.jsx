import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft,
  Settings,
  Volume2,
  VolumeX,
  Users,
  Clock,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChatInterface from '../../components/talk/ChatInterface.jsx';
import { T } from '@/components/common/TranslatableText';

// Redux 액션들
import { 
  loadSession, 
  loadUsage, 
  startNewSession,
  updateSettings,
  setMuted,
  clearErrors,
  selectCurrentSession,
  selectUsage,
  selectSettings,
  selectIsLoading,
  selectStats,
  selectEmotionHistory
} from '../../store/slices/talkSlice.js';

import { getConversationLevel } from '../../shared/constants/levels';

const ChatSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessionId } = useParams();
  
  // Redux 상태
  const { user } = useSelector(state => state.auth);
  const currentSession = useSelector(selectCurrentSession);
  const usage = useSelector(selectUsage);
  const settings = useSelector(selectSettings);
  const isLoading = useSelector(selectIsLoading);
  const stats = useSelector(selectStats);
  const emotionHistory = useSelector(selectEmotionHistory);
  
  // 로컬 상태
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 사용자 레벨 설정
  const userLevel = user?.profile?.koreanLevel || settings.level || 'beginner';
  const levelConfig = getConversationLevel(userLevel);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    dispatch(clearErrors());
    
    if (sessionId) {
      // 기존 세션 로드
      dispatch(loadSession({ sessionId }));
    } else {
      // 새 세션 시작
      dispatch(startNewSession());
    }
    
    // 사용량 정보 로드
    dispatch(loadUsage());
  }, [dispatch, sessionId]);

  // 레벨 변경 시 설정 업데이트
  useEffect(() => {
    if (userLevel !== settings.level) {
      dispatch(updateSettings({ level: userLevel }));
    }
  }, [dispatch, userLevel, settings.level]);

  // 세션 변경 핸들러
  const handleSessionChange = (session) => {
    if (session?.sessionId && session.sessionId !== sessionId) {
      // URL 업데이트 (새 세션 생성 시)
      window.history.replaceState(
        null, 
        '', 
        `/talk/session/${session.sessionId}`
      );
    }
  };

  // 음소거 토글
  const toggleMute = () => {
    dispatch(setMuted(!settings.isMuted));
  };

  // 설정 변경
  const handleSettingsChange = (newSettings) => {
    dispatch(updateSettings(newSettings));
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 감정 통계 계산
  const getEmotionStats = () => {
    if (emotionHistory.length === 0) return null;
    
    const emotionCounts = emotionHistory.reduce((acc, item) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1;
      return acc;
    }, {});
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      dominantEmotion: dominantEmotion ? dominantEmotion[0] : null,
      totalEmotions: emotionHistory.length,
      emotionCounts
    };
  };

  const emotionStats = getEmotionStats();

  // 전체화면 모드
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="h-full flex flex-col">
          {/* 최소 헤더 */}
          <div className="bg-gray-50 border-b px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="ml-1">나가기</span>
                </Button>
                <span className="text-sm text-gray-600">
                  {levelConfig?.name} 레벨
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className={settings.isMuted ? 'text-red-500' : 'text-gray-600'}
                >
                  {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* 채팅 인터페이스 */}
          <div className="flex-1">
            <ChatInterface 
              sessionId={sessionId}
              onSessionChange={handleSessionChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading && (!currentSession || currentSession.messages.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto flex">
        
        {/* 메인 채팅 영역 */}
        <div className="flex-1 flex flex-col">
          
          {/* 헤더 */}
          <div className="bg-white shadow-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/talk')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    <T fallback="대화 목록">대화 목록</T>
                  </span>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    <T fallback="AI 한국어 대화">AI 한국어 대화</T>
                  </h1>
                  <p className="text-sm text-gray-500">
                    <T fallback={levelConfig?.name}>{levelConfig?.name}</T> 레벨 • 
                    <T fallback={`${stats.totalMessages}개 메시지`}>
                      {stats.totalMessages}개 메시지
                    </T>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSessionInfo(!showSessionInfo)}
                  className="text-gray-600"
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-gray-600"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className={settings.isMuted ? 'text-red-500' : 'text-gray-600'}
                >
                  {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/talk/settings')}
                  className="text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 채팅 인터페이스 */}
          <div className="flex-1">
            <ChatInterface 
              sessionId={sessionId}
              onSessionChange={handleSessionChange}
              className="h-full"
            />
          </div>
        </div>

        {/* 사이드바 (세션 정보) */}
        {showSessionInfo && (
          <div className="w-80 bg-white border-l flex flex-col">
            
            {/* 사이드바 헤더 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  <T fallback="세션 정보">세션 정보</T>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSessionInfo(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* 사이드바 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* 세션 통계 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  <T fallback="대화 통계">대화 통계</T>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <T fallback="총 메시지">총 메시지</T>
                    </span>
                    <span className="text-sm font-medium">{stats.totalMessages}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <T fallback="사용량">사용량</T>
                    </span>
                    <span className="text-sm font-medium">
                      {usage.dailyLimit - usage.remaining}/{usage.dailyLimit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      <T fallback="세션 시간">세션 시간</T>
                    </span>
                    <span className="text-sm font-medium">
                      {currentSession.createdAt ? 
                        Math.round((Date.now() - new Date(currentSession.createdAt).getTime()) / 60000) : 0
                      }분
                    </span>
                  </div>
                </div>
              </div>

              {/* 감정 분석 */}
              {emotionStats && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    <T fallback="감정 분석">감정 분석</T>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        <T fallback="주요 감정">주요 감정</T>
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {emotionStats.dominantEmotion || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        <T fallback="감정 분석 횟수">감정 분석 횟수</T>
                      </span>
                      <span className="text-sm font-medium">{emotionStats.totalEmotions}회</span>
                    </div>
                  </div>
                  
                  {/* 감정 분포 */}
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">
                      <T fallback="감정 분포">감정 분포</T>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(emotionStats.emotionCounts || {}).map(([emotion, count]) => (
                        <div key={emotion} className="flex items-center space-x-2">
                          <div className="w-12 text-xs text-gray-600 capitalize">{emotion}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ 
                                width: `${(count / emotionStats.totalEmotions) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 레벨 정보 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  <T fallback="레벨 설정">레벨 설정</T>
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <T fallback="현재 레벨">현재 레벨</T>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      <T fallback={levelConfig?.name}>{levelConfig?.name}</T>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <T fallback="언어 비율">언어 비율</T>
                    </div>
                    <div className="text-sm text-gray-800">
                      <T fallback={levelConfig?.talk?.languageRatio}>
                        {levelConfig?.talk?.languageRatio}
                      </T>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <T fallback="말하기 속도">말하기 속도</T>
                    </div>
                    <div className="text-sm text-gray-800">
                      <T fallback={levelConfig?.talk?.speed}>
                        {levelConfig?.talk?.speed}
                      </T>
                    </div>
                  </div>
                </div>
              </div>

              {/* 세션 세부 정보 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  <T fallback="세션 세부 정보">세션 세부 정보</T>
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <T fallback="세션 ID">세션 ID</T>
                    </div>
                    <div className="text-xs font-mono text-gray-800 bg-gray-100 p-1 rounded">
                      {currentSession.sessionId?.slice(-12) || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <T fallback="시작 시간">시작 시간</T>
                    </div>
                    <div className="text-sm text-gray-800">
                      {currentSession.createdAt ? 
                        new Date(currentSession.createdAt).toLocaleString('ko-KR') : 
                        'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      <T fallback="마지막 활동">마지막 활동</T>
                    </div>
                    <div className="text-sm text-gray-800">
                      {currentSession.lastActivity ? 
                        new Date(currentSession.lastActivity).toLocaleString('ko-KR') : 
                        'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSession;