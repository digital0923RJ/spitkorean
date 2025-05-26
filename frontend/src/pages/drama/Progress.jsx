import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Target, 
  Award,
  BookOpen,
  Star,
  ChevronRight,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// 컴포넌트
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TranslatableText, { T } from '../../components/common/TranslatableText';

// Redux 액션
import { 
  fetchDramaProgress,
  selectProgress,
  selectDramaLoading,
  selectDramaError
} from '../../store/slices/dramaSlice.js';

// API
import { getDramaProgress } from '../../api/drama';

// 유틸리티
import { 
  dateUtils, 
  numberUtils, 
  spitKoreanUtils 
} from '../../utils/format.js';

// 상수
import { getDramaLevel } from '../../shared/constants/levels';

const Progress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Redux 상태
  const progressData = useSelector(selectProgress);
  const loading = useSelector(selectDramaLoading);
  const error = useSelector(selectDramaError);
  
  // 세션 완료 데이터 (SentencePractice에서 전달받음)
  const completedSession = location.state?.completedSession;
  
  // 로컬 상태
  const [timeFilter, setTimeFilter] = useState('week'); // week, month, all
  const [levelFilter, setLevelFilter] = useState('all');

  // 사용자 레벨
  const userLevel = user?.profile?.koreanLevel || 'beginner';

  // 데이터 로드
  useEffect(() => {
    loadProgressData();
  }, [dispatch]);

  const loadProgressData = async () => {
    try {
      // Redux를 통한 데이터 로드
      await dispatch(fetchDramaProgress()).unwrap();
    } catch (err) {
      console.error('Failed to load progress data:', err);
      
      // fallback으로 직접 API 호출
      try {
        const response = await getDramaProgress();
        // 성공 시 Redux 상태 업데이트는 필요에 따라 추가
      } catch (directError) {
        console.error('Direct API call also failed:', directError);
      }
    }
  };

  // 필터링된 데이터
  const getFilteredProgress = () => {
    if (!progressData?.progress) return [];
    
    let filtered = progressData.progress;
    
    // 레벨 필터
    if (levelFilter !== 'all') {
      filtered = filtered.filter(item => item.level === levelFilter);
    }
    
    // 시간 필터 (서버에서 지원하면 여기서 추가 필터링)
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDays = timeFilter === 'week' ? 7 : 30;
      const filterDate = new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(item => {
        const lastUpdated = new Date(item.last_updated);
        return lastUpdated >= filterDate;
      });
    }
    
    return filtered;
  };

  // 전체 통계 계산
  const calculateOverallStats = () => {
    if (!progressData) return { totalCompleted: 0, averageAccuracy: 0, streakDays: 0 };
    
    const totalCompleted = progressData.total_completed || 0;
    const averageAccuracy = progressData.daily_activity?.length > 0 
      ? Math.round(progressData.daily_activity.reduce((sum, day) => sum + day.accuracy, 0) / progressData.daily_activity.length)
      : 0;
    
    // 연속 학습일 계산
    const streakDays = calculateStreakDays();
    
    return { totalCompleted, averageAccuracy, streakDays };
  };

  const calculateStreakDays = () => {
    if (!progressData?.daily_activity) return 0;
    
    const today = new Date();
    let streak = 0;
    
    // 날짜 내림차순으로 정렬된 활동에서 연속성 확인
    const sortedActivity = [...progressData.daily_activity].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    for (let i = 0; i < sortedActivity.length; i++) {
      const activity = sortedActivity[i];
      const activityDate = new Date(activity.date);
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      // 날짜가 연속되는지 확인 (하루 차이까지 허용)
      const diffDays = Math.abs((expectedDate - activityDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // 레벨별 색상
  const getLevelColor = (level) => {
    const levelConfig = getDramaLevel(level);
    return levelConfig?.color || 'gray';
  };

  // 파일 다운로드 핸들러
  const handleDownloadReport = () => {
    const reportData = {
      user: user?.profile?.name || '사용자',
      level: userLevel,
      generated_at: new Date().toISOString(),
      progress: getFilteredProgress(),
      stats: calculateOverallStats(),
      level_stats: progressData?.level_stats || {}
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drama-progress-report-${dateUtils.formatKoreanDate(new Date(), { format: 'numeric' })}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading.progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            <T>진행 상황을 불러오는 중</T>...
          </p>
        </div>
      </div>
    );
  }

  const filteredProgress = getFilteredProgress();
  const overallStats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/drama')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <T>Drama 홈</T>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <T>학습 진행률</T>
                </h1>
                <p className="text-gray-600">
                  <T>드라마별 문장 구성 학습 현황을 확인하세요</T>
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <T>리포트 다운로드</T>
            </Button>
          </div>

          {/* 완료된 세션 축하 메시지 */}
          {completedSession && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    <T>세션 완료</T>!
                  </h3>
                  <p className="text-green-700 text-sm">
                    {completedSession.sentences}<T>문장 중</T> {completedSession.correct}<T>개 정답</T>
                    (<T>정확도</T> {numberUtils.formatPercentage(completedSession.accuracy)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 전체 통계 */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  <T>완료한 문장</T>
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {numberUtils.formatNumber(overallStats.totalCompleted)}<T>개</T>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  <T>평균 정확도</T>
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {numberUtils.formatPercentage(overallStats.averageAccuracy)}
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  <T>연속 학습</T>
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {overallStats.streakDays}<T>일</T> 🔥
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  <T>학습한 드라마</T>
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {filteredProgress.length}<T>개</T>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                <T>필터</T>:
              </span>
            </div>
            
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="week"><T>최근 1주일</T></option>
              <option value="month"><T>최근 1개월</T></option>
              <option value="all"><T>전체 기간</T></option>
            </select>
            
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all"><T>모든 레벨</T></option>
              <option value="beginner"><T>초급</T></option>
              <option value="intermediate"><T>중급</T></option>
              <option value="advanced"><T>고급</T></option>
            </select>
          </div>
        </div>

        {/* 레벨별 진행률 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <T>레벨별 진행률</T>
          </h2>
          
          <div className="space-y-6">
            {Object.entries(progressData?.level_stats || {}).map(([level, stats]) => {
              const levelConfig = getDramaLevel(level);
              if (!levelConfig) return null;
              
              return (
                <div key={level} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${levelConfig.color}-500`} />
                      <span className="font-medium text-gray-900">
                        <T>{levelConfig.name}</T>
                      </span>
                      {level === userLevel && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          <T>현재 레벨</T>
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {numberUtils.formatNumber(stats.completed)} / {numberUtils.formatNumber(stats.total)} <T>문장</T>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full bg-${levelConfig.color}-500 transition-all duration-500`}
                      style={{ width: `${stats.completion_rate}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{numberUtils.formatPercentage(stats.completion_rate)} <T>완료</T></span>
                    <span>{numberUtils.formatNumber(stats.total - stats.completed)}<T>문장 남음</T></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 드라마별 진행률 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <T>드라마별 진행률</T>
          </h2>
          
          {filteredProgress.length > 0 ? (
            <div className="space-y-4">
              {filteredProgress.map((drama) => {
                const levelColor = getLevelColor(drama.level);
                const levelConfig = getDramaLevel(drama.level);
                
                return (
                  <div key={drama.drama_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-${levelColor}-100 rounded-lg`}>
                          <BookOpen className={`w-5 h-5 text-${levelColor}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            <T>{drama.drama_title}</T>
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 bg-${levelColor}-100 text-${levelColor}-800 rounded-full text-xs`}>
                              <T>{levelConfig?.name}</T>
                            </span>
                            <span>•</span>
                            <span>
                              <T>마지막 학습</T>: {dateUtils.formatKoreanDate(drama.last_updated, { format: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/drama/practice?drama=${drama.drama_id}`)}
                        className="flex items-center space-x-2"
                      >
                        <T>계속 학습</T>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          <T>진행률</T>
                        </span>
                        <span className="font-medium text-gray-900">
                          {numberUtils.formatNumber(drama.completed_sentences)} / {numberUtils.formatNumber(drama.total_sentences)} <T>문장</T>
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${levelColor}-500 transition-all duration-300`}
                          style={{ width: `${drama.completion_rate}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{numberUtils.formatPercentage(drama.completion_rate)} <T>완료</T></span>
                        <span>{numberUtils.formatNumber(drama.total_sentences - drama.completed_sentences)}<T>문장 남음</T></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {levelFilter !== 'all' ? (
                  <T>{levelFilter} 레벨의 학습 기록이 없습니다</T>
                ) : (
                  <T>학습 기록이 없습니다</T>
                )}
              </h3>
              <p className="text-gray-500 mb-4">
                <T>드라마 문장 연습을 시작해보세요</T>!
              </p>
              <Button 
                onClick={() => navigate('/drama/practice')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <T>연습 시작하기</T>
              </Button>
            </div>
          )}
        </div>

        {/* 일일 활동 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <T>일일 학습 활동</T>
          </h2>
          
          {progressData?.daily_activity?.length > 0 ? (
            <div className="grid grid-cols-7 gap-4">
              {progressData.daily_activity.slice(-7).map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">
                    {dateUtils.formatKoreanDate(day.date, { includeDay: true, format: 'short' }).split(' ')[0]}
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    day.sentences > 0 ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      day.sentences > 0 ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {day.sentences}
                    </span>
                  </div>
                  {day.sentences > 0 && (
                    <div className="text-xs text-gray-500">
                      {numberUtils.formatPercentage(day.accuracy)} <T>정확도</T>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                <T>아직 학습 활동이 없습니다</T>
              </p>
            </div>
          )}
        </div>

        {/* 에러 표시 */}
        {error.progress && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <T>{error.progress}</T>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadProgressData}
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

export default Progress;