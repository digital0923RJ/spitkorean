// src/pages/test/TestHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock,
  Play,
  Trophy,
  BarChart3,
  Brain,
  CheckCircle
} from 'lucide-react';
import Button, { PrimaryButton, OutlineButton } from '@/components/common/Button';
import { T } from '@/components/common/TranslatableText';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// API 함수
import { getTestUsage, getTestResults } from '../../api/test';

// 컴포넌트
import ProgressTracker from '../../components/test/ProgressTracker.jsx';

// 훅
import { useSubscription } from '../../hooks/useSubscription.js';

// 상수
import { getTopikLevel } from '../../shared/constants/levels';
import { PRODUCTS } from '../../shared/constants/products';

const TestHome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // 구독 훅 사용
  const { 
    hasSubscription, 
    getUsageInfo,
    mySubscriptions,
    usageStats
  } = useSubscription();
  
  // 상태 관리
  const [usage, setUsage] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(3); // 기본 3급
  const [selectedType, setSelectedType] = useState('mixed'); // 혼합 문제
  
  // 사용자 레벨 정보
  const userLevel = user?.profile?.koreanLevel || 'intermediate';
  const levelConfig = getTopikLevel(userLevel);
  const productInfo = PRODUCTS.test;

  // 구독 상태 확인
  const hasTestSubscription = hasSubscription('test');
  const testUsageInfo = getUsageInfo('test');

  // TOPIK 레벨 정보
  const topikLevels = [
    { level: 1, name: 'TOPIK I - 1급', color: 'emerald', difficulty: '초급', description: '기초 한국어', time: '70분' },
    { level: 2, name: 'TOPIK I - 2급', color: 'emerald', difficulty: '초급', description: '일상 표현', time: '70분' },
    { level: 3, name: 'TOPIK II - 3급', color: 'blue', difficulty: '중급', description: '사회생활 한국어', time: '110분' },
    { level: 4, name: 'TOPIK II - 4급', color: 'blue', difficulty: '중급', description: '업무 한국어', time: '110분' },
    { level: 5, name: 'TOPIK II - 5급', color: 'purple', difficulty: '고급', description: '전문 한국어', time: '110분' },
    { level: 6, name: 'TOPIK II - 6급', color: 'purple', difficulty: '고급', description: '학술 한국어', time: '110분' }
  ];

  // 문제 유형
  const questionTypes = [
    { id: 'mixed', name: '종합 문제', icon: BookOpen, description: '모든 영역 혼합', available: true },
    { id: 'vocabulary', name: '어휘', icon: Brain, description: '단어와 표현', available: true },
    { id: 'grammar', name: '문법', icon: Target, description: '문법 구조', available: true },
    { id: 'reading', name: '읽기', icon: BookOpen, description: '독해력', available: true },
    { id: 'listening', name: '듣기', icon: BookOpen, description: '청해력', available: true },
    { id: 'writing', name: '쓰기', icon: BookOpen, description: '작문 (3급 이상)', available: selectedLevel >= 3 }
  ];

  // 데이터 로드
  useEffect(() => {
    if (isAuthenticated && hasTestSubscription) {
      loadDashboardData();
    }
  }, [isAuthenticated, hasTestSubscription]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 실제 백엔드 API 호출
      const [usageResponse, resultsResponse] = await Promise.all([
        getTestUsage(),
        getTestResults()
      ]);
      
      // API 응답 구조에 맞게 데이터 설정
      if (usageResponse.status === 'success') {
        setUsage(usageResponse.data);
      }
      
      if (resultsResponse.status === 'success') {
        const { results, stats: resultStats } = resultsResponse.data;
        setStats(resultStats);
        setRecentTests(results.slice(0, 3)); // 최근 3개만 표시
      }
      
    } catch (err) {
      console.error('Dashboard data load error:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      
      // 에러 발생 시 임시 목업 데이터로 대체
      const mockUsage = {
        has_subscription: hasTestSubscription,
        daily_limit: 20,
        remaining: testUsageInfo.remaining,
        reset_at: new Date(Date.now() + 86400000).toISOString()
      };

      const mockStats = {
        total_tests: 23,
        average_score: 78.5,
        best_score: 95,
        completion_rate: 88,
        streak_days: 7,
        weekly_average: 82.3,
        level_stats: [
          { level: 1, average_score: 65, tests_taken: 5 },
          { level: 2, average_score: 72, tests_taken: 8 },
          { level: 3, average_score: 78, tests_taken: 10 }
        ],
        weaknesses: [
          { weakness: '문법 - 연결어미', count: 12 },
          { weakness: '어휘 - 고급 단어', count: 8 },
          { weakness: '읽기 - 추론', count: 6 }
        ]
      };

      const mockRecentTests = [
        { 
          result_id: '1', 
          level: 3, 
          test_type: 'mixed', 
          score: 85, 
          date: new Date().toISOString(), 
          questions_count: 20 
        },
        { 
          result_id: '2', 
          level: 3, 
          test_type: 'grammar', 
          score: 92, 
          date: new Date(Date.now() - 86400000).toISOString(), 
          questions_count: 15 
        },
        { 
          result_id: '3', 
          level: 2, 
          test_type: 'vocabulary', 
          score: 78, 
          date: new Date(Date.now() - 172800000).toISOString(), 
          questions_count: 10 
        }
      ];

      setUsage(mockUsage);
      setStats(mockStats);
      setRecentTests(mockRecentTests);
    } finally {
      setLoading(false);
    }
  };

  // 연습 시작
  const startPractice = () => {
    const currentUsage = usage || testUsageInfo;
    
    if (currentUsage.remaining <= 0) {
      alert('오늘의 사용량을 모두 사용했습니다. 내일 다시 시도해주세요!');
      return;
    }
    
    navigate('/test/quiz', { 
      state: { 
        level: selectedLevel, 
        type: selectedType,
        count: 10
      }
    });
  };

  // 모의고사 시작
  const startMockTest = () => {
    navigate('/test/mock', {
      state: { level: selectedLevel }
    });
  };

  // 구독이 없는 경우
  if (!hasTestSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              <T>Test & Study</T>
            </h1>
            <p className="text-gray-600 mb-6">
              <T>체계적인 TOPIK 문제 풀이로 한국어 실력을 향상시키세요</T>
            </p>
            <PrimaryButton 
              onClick={() => navigate('/subscription/plans')}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700"
              textKey="구독하고 시작하기"
            />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedLevelInfo = topikLevels.find(l => l.level === selectedLevel);
  const currentUsage = usage || testUsageInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Trophy className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <T>Test & Study</T>
                </h1>
                <p className="text-gray-600">
                  <T>TOPIK 시험 준비와 체계적인 한국어 학습</T>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                <T>추천 레벨</T>
              </div>
              <div className="text-lg font-semibold text-orange-600">
                <T>TOPIK {selectedLevel}급</T>
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
                <T>오늘의 학습</T>
              </h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    <T>사용량</T>
                  </span>
                  <span className="text-gray-900">
                    {(currentUsage.daily_limit || currentUsage.limit) - (currentUsage.remaining || 0)} / {currentUsage.daily_limit || currentUsage.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${currentUsage.percentage || 0}%` 
                    }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <T>{currentUsage.remaining || 0}문제 남음 • {currentUsage.reset_at ? new Date(currentUsage.reset_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '24:00'} 초기화</T>
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
                <T>연습 시작</T>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                <T>{selectedLevelInfo?.description} 문제</T>
              </p>
              <Button 
                onClick={startPractice}
                disabled={(currentUsage.remaining || 0) <= 0}
                className="w-full bg-green-600 hover:bg-green-700"
                textKey={(currentUsage.remaining || 0) > 0 ? '문제 풀기' : '사용량 초과'}
              />
            </div>
          </div>

          {/* 학습 통계 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                <T>학습 통계</T>
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <T>완료한 문제</T>
                </span>
                <span className="font-semibold">{stats?.total_tests || 0}회</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <T>평균 점수</T>
                </span>
                <span className="font-semibold text-green-600">{stats?.average_score || 0}점</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <T>연속 학습</T>
                </span>
                <span className="font-semibold text-orange-600">{stats?.streak_days || 0}일 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* 진행률 추적기 */}
        {stats && (
          <ProgressTracker
            stats={stats}
            recentTests={recentTests}
            weaknesses={stats.weaknesses || []}
            achievements={[]}
            level={selectedLevel}
            compact={false}
            showDetails={true}
          />
        )}

        {/* 레벨 및 문제 유형 선택 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <T>학습 설정</T>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* 레벨 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <T>TOPIK 레벨 선택</T>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {topikLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setSelectedLevel(level.level)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedLevel === level.level
                        ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{level.level}급</div>
                    <div className="text-xs text-gray-500">
                      <T>{level.difficulty}</T>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 문제 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <T>문제 유형 선택</T>
              </label>
              <div className="space-y-2">
                {questionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      disabled={!type.available}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedType === type.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        !type.available 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        <div>
                          <div className="text-sm font-medium">
                            <T>{type.name}</T>
                          </div>
                          <div className="text-xs text-gray-500">
                            <T>{type.description}</T>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 시작 버튼들 */}
          <div className="flex space-x-4 mt-6">
            <Button
              onClick={startPractice}
              disabled={(currentUsage?.remaining || 0) <= 0}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <div className="flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" />
                <T>연습 시작 (10문제)</T>
              </div>
            </Button>

            <OutlineButton
              onClick={startMockTest}
              className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <div className="flex items-center justify-center">
                <Trophy className="h-5 w-5 mr-2" />
                <T>모의고사 ({selectedLevelInfo?.time})</T>
              </div>
            </OutlineButton>
          </div>
        </div>

        {/* 선택된 레벨 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              <T>{selectedLevelInfo?.name}</T>
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${selectedLevelInfo?.color}-100 text-${selectedLevelInfo?.color}-700`}>
              <T>{selectedLevelInfo?.difficulty}</T>
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            <T>{selectedLevelInfo?.description}</T>
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`text-center p-3 bg-${selectedLevelInfo?.color}-50 rounded-lg`}>
              <div className={`text-lg font-bold text-${selectedLevelInfo?.color}-600`}>
                {selectedLevelInfo?.time}
              </div>
              <div className={`text-xs text-${selectedLevelInfo?.color}-600`}>
                <T>시험 시간</T>
              </div>
            </div>
            <div className={`text-center p-3 bg-${selectedLevelInfo?.color}-50 rounded-lg`}>
              <div className={`text-lg font-bold text-${selectedLevelInfo?.color}-600`}>
                {selectedLevel <= 2 ? '100점' : '300점'}
              </div>
              <div className={`text-xs text-${selectedLevelInfo?.color}-600`}>
                <T>총점</T>
              </div>
            </div>
            <div className={`text-center p-3 bg-${selectedLevelInfo?.color}-50 rounded-lg`}>
              <div className={`text-lg font-bold text-${selectedLevelInfo?.color}-600`}>
                {selectedLevel <= 2 ? '50점' : selectedLevel <= 4 ? '120점' : '150점'}
              </div>
              <div className={`text-xs text-${selectedLevelInfo?.color}-600`}>
                <T>합격선</T>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 성과 및 약점 분석 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 최근 테스트 결과 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                <T>최근 테스트</T>
              </h2>
              <OutlineButton 
                size="sm"
                onClick={() => navigate('/test/results')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <T>전체 보기</T>
              </OutlineButton>
            </div>

            {recentTests.length > 0 ? (
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div 
                    key={test.result_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          <T>TOPIK {test.level}급 • {questionTypes.find(t => t.id === test.test_type)?.name || test.test_type}</T>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(test.date).toLocaleDateString('ko-KR')} • {test.questions_count}문제
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        test.score >= 80 ? 'text-green-600' : 
                        test.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {test.score}점
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <T>아직 테스트 기록이 없습니다</T>
                </h3>
                <p className="text-gray-500 mb-4">
                  <T>첫 번째 문제 풀이를 시작해보세요!</T>
                </p>
                <Button 
                  onClick={startPractice}
                  disabled={(currentUsage?.remaining || 0) <= 0}
                  textKey="연습 시작하기"
                />
              </div>
            )}
          </div>

          {/* 약점 분석 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                <T>약점 분석</T>
              </h2>
              <OutlineButton 
                size="sm"
                onClick={() => navigate('/test/statistics')}
                className="flex items-center space-x-2"
              >
                <Target className="w-4 h-4" />
                <T>상세 분석</T>
              </OutlineButton>
            </div>

            {stats?.weaknesses?.length > 0 ? (
              <div className="space-y-3">
                {stats.weaknesses.slice(0, 4).map((weakness, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700 text-sm">
                      <T>{weakness.weakness || weakness.category || weakness}</T>
                    </span>
                    <span className="text-sm text-red-600 font-medium">{weakness.count}회</span>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    💡 <strong><T>추천:</T></strong> <T>문법 연결어미 집중 연습을 해보세요</T>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <T>분석할 데이터가 부족합니다</T>
                </h3>
                <p className="text-gray-500">
                  <T>더 많은 문제를 풀면 약점 분석을 제공해드려요</T>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <T>{error}</T>
            </div>
            <OutlineButton 
              size="sm" 
              onClick={loadDashboardData}
              className="mt-2"
              textKey="다시 시도"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHome;