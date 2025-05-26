import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Play, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Film
} from 'lucide-react';

// 컴포넌트
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { T } from '../../components/common/TranslatableText';
import SentenceBuilder from '../../components/drama/SentenceBuilder.jsx';

// 훅
import { useSubscription } from '../../hooks/useSubscription.js';

// API
import { getDramaUsage, getDramaProgress } from '../../api/drama';

// 상수
import { getDramaLevel } from '../../shared/constants/levels';
import { PRODUCTS } from '../../shared/constants/products';

const DramaHome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // 구독 관련 훅
  const { 
    hasSubscription, 
    getUsageInfo, 
    initializeSubscription 
  } = useSubscription();
  
  // 상태 관리
  const [usage, setUsage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [popularDramas, setPopularDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSentenceBuilder, setShowSentenceBuilder] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);
  
  // 사용자 레벨 정보
  const userLevel = user?.profile?.koreanLevel || 'beginner';
  const levelConfig = getDramaLevel(userLevel);
  const productInfo = PRODUCTS.drama;

  // Drama 구독 상태 확인
  const hasDramaSubscription = hasSubscription('drama');

  // 인기 드라마 데이터 (임시)
  const mockPopularDramas = {
    beginner: [
      { id: 1, title: '뽀로로', category: '어린이', episodes: 52, difficulty: 1, image: '🐧' },
      { id: 2, title: '타요 버스', category: '어린이', episodes: 26, difficulty: 1, image: '🚌' },
      { id: 3, title: '응답하라 1988', category: '가족', episodes: 20, difficulty: 2, image: '📺' },
    ],
    intermediate: [
      { id: 4, title: '사랑의 불시착', category: '로맨스', episodes: 16, difficulty: 3, image: '💕' },
      { id: 5, title: '미생', category: '직장', episodes: 20, difficulty: 3, image: '💼' },
      { id: 6, title: '슬기로운 의사생활', category: '의료', episodes: 24, difficulty: 4, image: '🏥' },
    ],
    advanced: [
      { id: 7, title: '킹덤', category: '사극', episodes: 12, difficulty: 5, image: '👑' },
      { id: 8, title: '이상한 변호사 우영우', category: '법정', episodes: 16, difficulty: 5, image: '⚖️' },
      { id: 9, title: '육룡이 나르샤', category: '사극', episodes: 50, difficulty: 6, image: '🐉' },
    ]
  };

  // 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      initializeSubscription();
    }
  }, [isAuthenticated, initializeSubscription]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (hasDramaSubscription) {
        // 실제 API 호출
        const [usageResponse, progressResponse] = await Promise.all([
          getDramaUsage(),
          getDramaProgress()
        ]);
        
        setUsage(usageResponse.data);
        setProgress(progressResponse.data);
      } else {
        // 구독이 없는 경우 임시 데이터
        setUsage({
          has_subscription: false,
          daily_limit: 20,
          remaining: 0,
          reset_at: new Date(Date.now() + 86400000).toISOString()
        });
      }
      
      setPopularDramas(mockPopularDramas[userLevel] || mockPopularDramas.beginner);
      
    } catch (err) {
      console.error('Dashboard data load error:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      
      // 에러 시 fallback 데이터
      const fallbackUsage = hasDramaSubscription ? {
        has_subscription: true,
        daily_limit: 20,
        remaining: 15,
        reset_at: new Date(Date.now() + 86400000).toISOString()
      } : {
        has_subscription: false,
        daily_limit: 20,
        remaining: 0,
        reset_at: new Date(Date.now() + 86400000).toISOString()
      };

      const fallbackProgress = {
        total_completed: 0,
        level_stats: {
          beginner: { completed: 0, total: 30, completion_rate: 0 },
          intermediate: { completed: 0, total: 25, completion_rate: 0 },
          advanced: { completed: 0, total: 20, completion_rate: 0 }
        }
      };

      setUsage(fallbackUsage);
      setProgress(fallbackProgress);
      setPopularDramas(mockPopularDramas[userLevel] || mockPopularDramas.beginner);
    } finally {
      setLoading(false);
    }
  };

  // 문장 연습 시작
  const startPractice = () => {
    if (!hasDramaSubscription) {
      navigate('/subscription/plans');
      return;
    }
    setShowSentenceBuilder(true);
  };

  // 드라마 선택
  const selectDrama = (drama) => {
    if (!hasDramaSubscription) {
      navigate('/subscription/plans');
      return;
    }
    setSelectedDrama(drama);
    setShowSentenceBuilder(true);
  };

  // 문장 연습 완료 핸들러
  const handlePracticeComplete = (userSentence, userAnswer) => {
    console.log('연습 완료:', { userSentence, userAnswer });
    // 여기서 추가 로직 처리 가능 (XP 업데이트, 통계 등)
  };

  // 구독이 없는 경우
  if (!hasDramaSubscription && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              <T>Drama Builder</T>
            </h1>
            <p className="text-gray-600 mb-6">
              <T fallback="실제 드라마 대사로 한국어 문장 구성을 마스터하세요">
                실제 드라마 대사로 한국어 문장 구성을 마스터하세요
              </T>
            </p>
            <Button 
              onClick={() => navigate('/subscription/plans')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <T>구독하고 시작하기</T>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 문장 구성 연습 화면
  if (showSentenceBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로 가기 버튼 */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowSentenceBuilder(false);
                setSelectedDrama(null);
              }}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <T>홈으로 돌아가기</T>
            </Button>
          </div>

          {/* 선택된 드라마 정보 */}
          {selectedDrama && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedDrama.image}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    <T>{selectedDrama.title}</T>
                  </h2>
                  <p className="text-gray-600">
                    <T>{selectedDrama.category}</T> • {selectedDrama.episodes}화
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 문장 구성 연습 */}
          <SentenceBuilder
            level={userLevel}
            onComplete={handlePracticeComplete}
            showActions={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <T>Drama Builder</T>
                </h1>
                <p className="text-gray-600">
                  <T fallback="실제 드라마 대사로 문장 구성 마스터하기">
                    실제 드라마 대사로 문장 구성 마스터하기
                  </T>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                <T fallback="현재 레벨">현재 레벨</T>
              </div>
              <div className="text-lg font-semibold text-purple-600 capitalize">
                <T fallback={levelConfig?.name}>{levelConfig?.name}</T>
              </div>
            </div>
          </div>
        </div>

        {/* 사용량 및 빠른 액션 */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* 오늘의 사용량 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                <T fallback="오늘의 학습">오늘의 학습</T>
              </h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    <T fallback="사용량">사용량</T>
                  </span>
                  <span className="text-gray-900">
                    {usage?.daily_limit - usage?.remaining || 0} / {usage?.daily_limit || 20}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${usage?.daily_limit ? ((usage.daily_limit - usage.remaining) / usage.daily_limit) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <T fallback={`${usage?.remaining || 0}문장 남음`}>
                  {usage?.remaining || 0}문장 남음
                </T> • {usage?.reset_at ? new Date(usage.reset_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '24:00'} <T fallback="초기화">초기화</T>
              </div>
            </div>
          </div>

          {/* 빠른 시작 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <T fallback="문장 연습 시작">문장 연습 시작</T>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                <T fallback={levelConfig?.drama?.sentenceLength}>
                  {levelConfig?.drama?.sentenceLength}
                </T>
              </p>
              <Button 
                onClick={startPractice}
                disabled={usage?.remaining <= 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <T>
                  {usage?.remaining > 0 ? '연습 시작하기' : '사용량 초과'}
                </T>
              </Button>
            </div>
          </div>

          {/* 진행 통계 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                <T fallback="학습 통계">학습 통계</T>
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <T fallback="완료한 문장">완료한 문장</T>
                </span>
                <span className="font-semibold">{progress?.total_completed || 0}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <T fallback="현재 레벨 진도">현재 레벨 진도</T>
                </span>
                <span className="font-semibold">
                  {progress?.level_stats?.[userLevel]?.completion_rate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <T fallback="연속 학습">연속 학습</T>
                </span>
                <span className="font-semibold text-orange-600">5일 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* 레벨별 추천 드라마 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              <T fallback={`${levelConfig?.name} 추천 드라마`}>
                {levelConfig?.name} 추천 드라마
              </T>
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/drama/browse')}
              className="flex items-center space-x-2"
            >
              <Film className="w-4 h-4" />
              <T>전체 보기</T>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {popularDramas.map((drama) => (
              <div 
                key={drama.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => selectDrama(drama)}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{drama.image}</div>
                  <h3 className="font-semibold text-gray-900">
                    <T fallback={drama.title}>{drama.title}</T>
                  </h3>
                  <p className="text-sm text-gray-500">
                    <T fallback={drama.category}>{drama.category}</T>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <T fallback="에피소드">에피소드</T>
                    </span>
                    <span className="text-gray-900">{drama.episodes}화</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <T fallback="난이도">난이도</T>
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${
                            i < drama.difficulty 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 mt-3"
                  >
                    <T>문장 연습하기</T>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 학습 진행률 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <T fallback="레벨별 진행률">레벨별 진행률</T>
          </h2>
          
          <div className="space-y-6">
            {Object.entries(progress?.level_stats || {}).map(([level, stats]) => {
              const levelInfo = getDramaLevel(level);
              if (!levelInfo) return null;
              
              return (
                <div key={level} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${levelInfo.color}-500`} />
                      <span className="font-medium text-gray-900">
                        <T fallback={levelInfo.name}>{levelInfo.name}</T>
                      </span>
                      {level === userLevel && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          <T fallback="현재 레벨">현재 레벨</T>
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.completed} / {stats.total} <T fallback="문장">문장</T>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${levelInfo.color}-500 transition-all duration-500`}
                      style={{ width: `${stats.completion_rate}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{stats.completion_rate.toFixed(1)}% <T fallback="완료">완료</T></span>
                    <span>{stats.total - stats.completed}<T fallback="문장 남음">문장 남음</T></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 레벨 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              <T fallback={`${levelConfig?.name} 레벨 특징`}>
                {levelConfig?.name} 레벨 특징
              </T>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  <T fallback="문장 길이">문장 길이</T>
                </div>
                <div className="text-gray-600">
                  <T fallback={levelConfig?.drama?.sentenceLength}>
                    {levelConfig?.drama?.sentenceLength}
                  </T>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  <T fallback="추천 드라마">추천 드라마</T>
                </div>
                <div className="text-gray-600">
                  <T fallback={levelConfig?.drama?.dramaTypes?.join(', ')}>
                    {levelConfig?.drama?.dramaTypes?.join(', ')}
                  </T>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  <T fallback="학습 문법">학습 문법</T>
                </div>
                <div className="text-gray-600">
                  <T fallback={levelConfig?.drama?.grammarFocus?.join(', ')}>
                    {levelConfig?.drama?.grammarFocus?.join(', ')}
                  </T>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  <T fallback="유사 문장">유사 문장</T>
                </div>
                <div className="text-gray-600">
                  {levelConfig?.drama?.similarSentences}개 <T fallback="제공">제공</T>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              <T fallback="최근 활동">최근 활동</T>
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/drama/progress')}
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <T>전체 기록</T>
            </Button>
          </div>

          {/* 임시 최근 활동 데이터 */}
          <div className="space-y-4">
            {[
              { date: '오늘', drama: '사랑의 불시착', sentences: 8, accuracy: 92 },
              { date: '어제', drama: '미생', sentences: 12, accuracy: 88 },
              { date: '2일 전', drama: '슬기로운 의사생활', sentences: 10, accuracy: 95 }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      <T fallback={activity.drama}>{activity.drama}</T>
                    </div>
                    <div className="text-sm text-gray-500">
                      <T fallback={activity.date}>{activity.date}</T>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">
                    {activity.sentences}<T fallback="문장 완료">문장 완료</T>
                  </div>
                  <div className="text-sm text-green-600">
                    <T fallback="정확도">정확도</T> {activity.accuracy}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <T fallback={error}>{error}</T>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
              className="mt-2"
            >
              <T>다시 시도</T>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DramaHome;