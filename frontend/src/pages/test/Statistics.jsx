// src/pages/test/Statistics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy,
  BookOpen,
  Clock,
  BarChart3,
  PieChart,
  ArrowLeft,
  Download,
  AlertCircle,
  Award,
  Zap
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTestResults } from '../../api/test';

// 액션
import { fetchTestResults } from '../../store/slices/testSlice.js';

// 유틸리티
import { numberUtils } from '../../utils/format.js';

const Statistics = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { results, ui } = useSelector(state => state.test);
  
  // 상태 관리
  const [stats, setStats] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // 데이터 로드
  useEffect(() => {
    loadStatistics();
  }, []);

  // 필터링된 결과 업데이트
  useEffect(() => {
    filterResults();
  }, [results.list, timeRange, selectedLevel, selectedType]);

  const loadStatistics = async () => {
    try {
      const response = await dispatch(fetchTestResults()).unwrap();
      setStats(response.stats);
    } catch (error) {
      console.error('Statistics load error:', error);
    }
  };

  // 기간별 필터링
  const filterResults = () => {
    let filtered = [...results.list];
    const now = new Date();
    
    // 시간 범위 필터
    if (timeRange !== 'all') {
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
      }
      
      filtered = filtered.filter(result => new Date(result.date) > cutoffDate);
    }
    
    // 레벨 필터
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(result => result.level === parseInt(selectedLevel));
    }
    
    // 유형 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.test_type === selectedType);
    }
    
    setFilteredResults(filtered);
  };

  // 리포트 다운로드
  const downloadReport = () => {
    const reportData = {
      user: {
        email: user?.email,
        name: user?.profile?.name
      },
      summary: {
        totalTests: stats?.total_tests || 0,
        averageScore: stats?.average_score || 0,
        bestScore: Math.max(...results.list.map(r => r.score), 0),
        timeRange,
        generatedAt: new Date().toISOString()
      },
      levelStats: stats?.level_stats || [],
      typeStats: stats?.type_stats || [],
      weaknesses: stats?.weaknesses || [],
      recentResults: filteredResults.slice(0, 20)
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topik-statistics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 통계 계산
  const calculateFilteredStats = () => {
    if (filteredResults.length === 0) {
      return {
        averageScore: 0,
        totalTests: 0,
        bestScore: 0,
        improvementRate: 0
      };
    }

    const scores = filteredResults.map(r => r.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    
    // 향상률 계산 (첫 번째와 마지막 테스트 비교)
    const improvementRate = filteredResults.length > 1 
      ? ((scores[0] - scores[scores.length - 1]) / scores[scores.length - 1]) * 100 
      : 0;

    return {
      averageScore,
      totalTests: filteredResults.length,
      bestScore,
      improvementRate
    };
  };

  const filteredStats = calculateFilteredStats();

  if (ui.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (ui.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{ui.error}</p>
          <Button onClick={() => navigate('/test')}>
            테스트 홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const timeRangeLabels = {
    week: '주',
    month: '달', 
    year: '해',
    all: '전체'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/test')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">학습 통계</h1>
                <p className="text-gray-600">나의 TOPIK 학습 성과를 확인해보세요</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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

        {/* 필터 영역 */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">기간:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="week">최근 1주일</option>
                <option value="month">최근 1개월</option>
                <option value="year">최근 1년</option>
                <option value="all">전체</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">레벨:</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">전체</option>
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <option key={level} value={level}>TOPIK {level}급</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">유형:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">전체</option>
                <option value="mixed">종합</option>
                <option value="vocabulary">어휘</option>
                <option value="grammar">문법</option>
                <option value="reading">읽기</option>
                <option value="listening">듣기</option>
                <option value="writing">쓰기</option>
              </select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTimeRange('month');
                setSelectedLevel('all');
                setSelectedType('all');
              }}
              className="ml-auto"
            >
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 필터된 통계 요약 */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {numberUtils.formatNumber(filteredStats.totalTests)}
            </div>
            <div className="text-gray-600">
              테스트 수 ({timeRangeLabels[timeRange]})
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {filteredStats.averageScore.toFixed(1)}점
            </div>
            <div className="text-gray-600">평균 점수</div>
            <div className="text-xs text-gray-500 mt-1">
              {numberUtils.formatPercentage(filteredStats.averageScore, { isDecimal: false })}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {filteredStats.bestScore.toFixed(1)}점
            </div>
            <div className="text-gray-600">최고 점수</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              filteredStats.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {filteredStats.improvementRate >= 0 ? '+' : ''}{filteredStats.improvementRate.toFixed(1)}%
            </div>
            <div className="text-gray-600">향상률</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* 레벨별 성과 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">레벨별 성과</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            {stats?.level_stats && stats.level_stats.length > 0 ? (
              <div className="space-y-4">
                {stats.level_stats.map((levelStat) => (
                  <div key={levelStat.level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        TOPIK {levelStat.level}급
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          평균 {levelStat.average_score.toFixed(1)}점
                        </div>
                        <div className="text-xs text-gray-500">
                          {levelStat.tests_taken}회 응시 • {numberUtils.formatPercentage(levelStat.average_score, { isDecimal: false })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(levelStat.average_score, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p>아직 레벨별 통계가 없습니다</p>
              </div>
            )}
          </div>

          {/* 유형별 성과 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">유형별 성과</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            {stats?.type_stats && stats.type_stats.length > 0 ? (
              <div className="space-y-4">
                {stats.type_stats.map((typeStat) => {
                  const typeNames = {
                    mixed: '종합',
                    vocabulary: '어휘',
                    grammar: '문법',
                    reading: '읽기',
                    listening: '듣기',
                    writing: '쓰기'
                  };
                  
                  return (
                    <div key={typeStat.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {typeNames[typeStat.type] || typeStat.type}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            평균 {typeStat.average_score.toFixed(1)}점
                          </div>
                          <div className="text-xs text-gray-500">
                            {typeStat.tests_taken}회 응시 • {numberUtils.formatPercentage(typeStat.average_score, { isDecimal: false })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(typeStat.average_score, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p>아직 유형별 통계가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 약점 분석 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">약점 분석</h2>
            <Target className="w-5 h-5 text-red-600" />
          </div>
          
          {stats?.weaknesses && stats.weaknesses.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {stats.weaknesses.slice(0, 6).map((weakness, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 font-medium text-sm">
                        {weakness.weakness}
                      </span>
                      <span className="text-red-600 text-sm font-bold">
                        {weakness.count}회
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-red-200 rounded-full h-1">
                      <div 
                        className="bg-red-600 h-1 rounded-full"
                        style={{ 
                          width: `${Math.min((weakness.count / Math.max(...stats.weaknesses.map(w => w.count))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-blue-700">
                  <strong>💡 학습 제안:</strong><br />
                  가장 많이 틀린 영역인 "<strong>{stats.weaknesses[0]?.weakness}</strong>"를 집중적으로 복습해보세요.
                  관련 문제를 더 풀어보시면 실력 향상에 도움이 될 것입니다.
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                약점 분석 데이터가 부족합니다
              </h3>
              <p className="text-gray-500 mb-4">
                더 많은 문제를 풀어보세요!
              </p>
              <Button onClick={() => navigate('/test')}>
                테스트 하러 가기
              </Button>
            </div>
          )}
        </div>

        {/* 최근 테스트 기록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              최근 테스트 기록 ({filteredResults.length}개)
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.slice(0, 10).map((result) => (
                <div key={result.result_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Trophy className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        TOPIK {result.level}급 • {result.test_type === 'mixed' ? '종합' : result.test_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(result.date).toLocaleDateString('ko-KR')} • {result.questions_count}문제
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      result.score >= 80 ? 'text-green-600' : 
                      result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.score.toFixed(1)}점
                    </div>
                    <div className="text-xs text-gray-500">
                      {numberUtils.formatPercentage(result.score, { isDecimal: false })}
                    </div>
                    {result.weaknesses && result.weaknesses.length > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        약점: {result.weaknesses[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredResults.length > 10 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/test/history')}
                    className="flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>전체 기록 보기 ({filteredResults.length - 10}개 더)</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                선택한 조건에 맞는 테스트 기록이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                새로운 테스트를 시작해보세요!
              </p>
              <Button onClick={() => navigate('/test')}>
                테스트 하러 가기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;