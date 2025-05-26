// src/pages/journey/LevelProgress.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  BookOpen,
  Mic,
  Clock,
  ArrowLeft,
  Download,
  Filter,
  Star,
  Award,
  Volume2
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getJourneyProgress } from '../../api/journey';

// 액션
import { 
  fetchProgress as loadProgress,
  selectProgress,
  selectLoading
} from '../../store/slices/journeySlice.js';

// 유틸리티
import { 
  numberUtils,
  dateUtils,
  spitKoreanUtils 
} from '../../utils/format.js';

const LevelProgress = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux 상태
  const progress = useSelector(selectProgress);
  const loading = useSelector(selectLoading);
  const { user } = useSelector(state => state.auth);
  
  // 로컬 상태 관리
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [levelFilter, setLevelFilter] = useState('all'); // all, level1, level2, level3, level4
  const [localLoading, setLocalLoading] = useState(false);

  // Korean Journey 레벨 정보
  const journeyLevels = [
    { id: 'level1', name: '한글 마스터', color: 'emerald' },
    { id: 'level2', name: '기초 리더', color: 'blue' },
    { id: 'level3', name: '중급 리더', color: 'purple' },
    { id: 'level4', name: '고급 리더', color: 'red' }
  ];

  // 콘텐츠 유형
  const contentTypes = {
    hangul: { name: '한글 학습', icon: BookOpen, color: 'green' },
    reading: { name: '읽기 연습', icon: BookOpen, color: 'blue' },
    pronunciation: { name: '발음 연습', icon: Mic, color: 'purple' },
    dialogue: { name: '대화 연습', icon: Volume2, color: 'orange' }
  };

  // 데이터 로드
  useEffect(() => {
    loadProgressData();
  }, [dispatch]);

  const loadProgressData = async () => {
    try {
      setLocalLoading(true);
      setError(null);
      
      // Redux 액션을 통한 진행 상황 로드
      await dispatch(loadProgress()).unwrap();
      
      // 또는 직접 API 호출
      const response = await getJourneyProgress();
      console.log('Direct API response:', response.data);
      
    } catch (err) {
      console.error('Progress load error:', err);
      setError(err.message || '진행 상황을 불러오는데 실패했습니다.');
    } finally {
      setLocalLoading(false);
    }
  };

  // 기간별 필터링
  const getFilteredHistory = () => {
    if (!progress?.history) return [];
    
    let filtered = [...progress.history];
    
    // 레벨 필터링
    if (levelFilter !== 'all') {
      filtered = filtered.filter(item => item.level === levelFilter);
    }
    
    // 기간 필터링
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return filtered;
    }
    
    return filtered.filter(item => new Date(item.date) > cutoffDate);
  };

  const filteredHistory = getFilteredHistory();

  // 발음 점수 포맷팅 (format.js 활용)
  const formatPronunciationScore = (score) => {
    return numberUtils.formatScore(score);
  };

  // 백분율 포맷팅 (format.js 활용)
  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return numberUtils.formatPercentage((value / total) * 100);
  };

  // 날짜 포맷팅 (format.js 활용)
  const formatDate = (date) => {
    return dateUtils.formatKoreanDate(date, { 
      includeTime: true, 
      format: 'short' 
    });
  };

  // 상대적 시간 포맷팅
  const formatRelativeTime = (date) => {
    return dateUtils.formatRelativeTime(date);
  };

  // 레벨 정보 포맷팅
  const formatLevelInfo = (levelId) => {
    return spitKoreanUtils.formatLevel(levelId, 'journey');
  };

  // 리포트 다운로드
  const downloadReport = () => {
    const reportData = {
      user: user?.email,
      period: timeRange,
      level: levelFilter,
      generated: new Date().toISOString(),
      stats: {
        total_readings: progress?.total_readings || 0,
        total_sentences: progress?.total_sentences || 0,
        avg_pronunciation: progress?.avg_pronunciation || 0,
        level_stats: progress?.level_stats || {},
        history: filteredHistory
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `korean-journey-report-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading.progress || localLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">학습 진행 상황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={loadProgressData} className="w-full">
              다시 시도
            </Button>
            <Button variant="outline" onClick={() => navigate('/journey')} className="w-full">
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/journey')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">학습 진행 상황</h1>
                <p className="text-gray-600">나의 Korean Journey 학습 성과를 확인해보세요</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 레벨 필터 */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">모든 레벨</option>
                {journeyLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
              
              {/* 기간 필터 */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="week">최근 1주일</option>
                <option value="month">최근 1개월</option>
                <option value="year">최근 1년</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadReport}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>리포트 다운로드</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 전체 통계 요약 */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {numberUtils.formatNumber(progress?.total_readings || 0)}
            </div>
            <div className="text-gray-600">총 읽기 수</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {numberUtils.formatNumber(progress?.total_sentences || 0)}
            </div>
            <div className="text-gray-600">완료한 문장</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(progress?.avg_pronunciation || 0).toFixed(1)}점
            </div>
            <div className="text-gray-600">평균 발음 점수</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {numberUtils.formatNumber(filteredHistory.length)}
            </div>
            <div className="text-gray-600">
              이번 {timeRange === 'week' ? '주' : timeRange === 'month' ? '달' : '해'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* 레벨별 성과 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">레벨별 성과</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              {journeyLevels.map((level) => {
                const stats = progress?.level_stats?.[level.id];
                if (!stats) return null;
                
                const scoreInfo = formatPronunciationScore(stats.average_pronunciation || 0);
                
                return (
                  <div key={level.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full bg-${level.color}-500`} />
                        <span className="font-medium text-gray-900">{level.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${scoreInfo.color}`}>
                          평균 발음 {(stats.average_pronunciation || 0).toFixed(1)}점
                        </div>
                        <div className="text-xs text-gray-500">
                          {numberUtils.formatNumber(stats.count || 0)}회 완료
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">발음 점수</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-${level.color}-500 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min(stats.average_pronunciation || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">평균 문장 수</div>
                        <div className="text-sm font-medium text-gray-900">
                          {(stats.average_sentences || 0).toFixed(1)}개
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 일일 학습 현황 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">일일 학습 현황</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {progress?.date_stats?.slice(0, 7).map((dayStat, index) => {
                const date = new Date(dayStat.date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    isToday ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        dayStat.count > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {dateUtils.formatKoreanDate(date, { 
                            format: 'short',
                            includeDay: true
                          })}
                          {isToday && <span className="ml-2 text-xs text-green-600">(오늘)</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {numberUtils.formatNumber(dayStat.count)}회
                      </div>
                      <div className="text-xs text-gray-500">
                        {numberUtils.formatNumber(dayStat.total_sentences)}문장
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 학습 기록 상세 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">상세 학습 기록</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {numberUtils.formatNumber(filteredHistory.length)}개 기록
              </span>
            </div>
          </div>
          
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((record) => {
                const levelInfo = journeyLevels.find(l => l.id === record.level);
                const typeInfo = contentTypes[record.content_type];
                const TypeIcon = typeInfo?.icon || BookOpen;
                const scoreInfo = formatPronunciationScore(record.pronunciation_score);
                
                return (
                  <div key={record.history_id || record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 bg-${levelInfo?.color}-100 rounded-lg`}>
                          <TypeIcon className={`w-5 h-5 text-${levelInfo?.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{record.content_title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{levelInfo?.name}</span>
                            <span>•</span>
                            <span>{typeInfo?.name}</span>
                            <span>•</span>
                            <span>{formatDate(record.date)}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(record.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${scoreInfo.color}`}>
                          {record.pronunciation_score}점
                        </div>
                        <div className="text-xs text-gray-500">발음 점수</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {record.reading_speed?.toFixed(1) || 0}x
                        </div>
                        <div className="text-xs text-gray-500">읽기 속도</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {numberUtils.formatNumber(record.completed_sentences || 0)}개
                        </div>
                        <div className="text-xs text-gray-500">완료 문장</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">학습 시간</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                선택한 조건에 맞는 학습 기록이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                다른 필터 조건을 선택하거나 새로운 학습을 시작해보세요
              </p>
              <Button onClick={() => navigate('/journey')}>
                학습 시작하기
              </Button>
            </div>
          )}
        </div>

        {/* 성과 요약 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">성과 요약</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">
                {Math.max(...filteredHistory.map(r => r.pronunciation_score || 0), 0)}점
              </div>
              <div className="text-sm text-green-600">최고 발음 점수</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">
                {Math.max(...filteredHistory.map(r => r.completed_sentences || 0), 0)}개
              </div>
              <div className="text-sm text-blue-600">최다 완료 문장</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">
                {Math.max(...filteredHistory.map(r => r.reading_speed || 0), 0).toFixed(1)}x
              </div>
              <div className="text-sm text-purple-600">최고 읽기 속도</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎉 축하합니다!
              </h3>
              <p className="text-gray-600">
                총 <strong>{numberUtils.formatNumber(progress?.total_sentences || 0)}개의 문장</strong>을 완료하고 
                평균 <strong>{(progress?.avg_pronunciation || 0).toFixed(1)}점</strong>의 발음 점수를 달성했어요!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                현재까지 {numberUtils.formatNumber(progress?.total_readings || 0)}회의 학습을 완료했습니다.
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => navigate('/journey')}
              >
                계속 학습하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;