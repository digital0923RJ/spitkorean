// src/components/test/ProgressTracker.jsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Trophy,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../common/Button';
import { numberUtils, dateUtils } from '../../utils/format.js';
import { T } from '../common/TranslatableText.jsx';

const ProgressTracker = ({ 
  stats = {},
  recentTests = [],
  weaknesses = [],
  achievements = [],
  level = 3,
  compact = false,
  showDetails = true
}) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'all'

  // 기본 통계값 설정
  const defaultStats = {
    total_tests: 0,
    average_score: 0,
    best_score: 0,
    completion_rate: 0,
    streak_days: 0,
    weekly_average: 0,
    improvement_rate: 0,
    time_spent: 0
  };

  const currentStats = { ...defaultStats, ...stats };

  // TOPIK 레벨별 설정
  const levelConfig = {
    1: { color: 'emerald', target: 50 },
    2: { color: 'emerald', target: 50 },
    3: { color: 'blue', target: 120 },
    4: { color: 'blue', target: 120 },
    5: { color: 'purple', target: 150 },
    6: { color: 'purple', target: 150 }
  };

  const config = levelConfig[level] || levelConfig[3];

  // 기간별 필터
  const periods = [
    { id: 'week', label: '이번 주', days: 7 },
    { id: 'month', label: '이번 달', days: 30 },
    { id: 'all', label: '전체', days: null }
  ];

  // 성취도 레벨 계산
  const getAchievementLevel = (score) => {
    if (score >= 90) return { level: 'excellent', label: '우수', color: 'green' };
    if (score >= 80) return { level: 'good', label: '양호', color: 'blue' };
    if (score >= 70) return { level: 'average', label: '보통', color: 'yellow' };
    if (score >= 60) return { level: 'needs_improvement', label: '개선 필요', color: 'orange' };
    return { level: 'poor', label: '미흡', color: 'red' };
  };

  const achievementLevel = getAchievementLevel(currentStats.average_score);

  // 섹션 토글
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // 컴팩트 모드
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* 주요 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold text-${config.color}-600`}>
              {numberUtils.formatNumber(currentStats.total_tests)}
            </div>
            <div className="text-xs text-gray-500">완료한 테스트</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold text-${achievementLevel.color}-600`}>
              {currentStats.average_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">평균 점수</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentStats.streak_days}
            </div>
            <div className="text-xs text-gray-500">연속 학습일</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {numberUtils.formatPercentage(currentStats.completion_rate)}
            </div>
            <div className="text-xs text-gray-500">완료율</div>
          </div>
        </div>
        
        {/* 진행률 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">목표 달성률</span>
            <span className="text-gray-900">
              {numberUtils.formatPercentage(Math.min((currentStats.average_score / config.target) * 100, 100))}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-${config.color}-600 h-2 rounded-full transition-all duration-500`}
              style={{ 
                width: `${Math.min((currentStats.average_score / config.target) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${config.color}-100 rounded-lg`}>
              <TrendingUp className={`w-6 h-6 text-${config.color}-600`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">학습 진행률</h3>
              <p className="text-sm text-gray-600">
                TOPIK {level}급 • {achievementLevel.label} 수준
              </p>
            </div>
          </div>
          
          {/* 기간 선택 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period.id
                    ? `bg-${config.color}-600 text-white`
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="p-6 grid md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className={`text-3xl font-bold text-${config.color}-600 mb-2`}>
            {numberUtils.formatNumber(currentStats.total_tests)}
          </div>
          <div className="text-sm text-gray-500">완료한 테스트</div>
          <div className="mt-2">
            <div className="flex items-center justify-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+{Math.round(currentStats.total_tests * 0.15)} 이번 주</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-bold text-${achievementLevel.color}-600 mb-2`}>
            {currentStats.average_score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">평균 점수</div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs bg-${achievementLevel.color}-100 text-${achievementLevel.color}-700`}>
              {achievementLevel.label}
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {currentStats.streak_days}
          </div>
          <div className="text-sm text-gray-500">연속 학습일 🔥</div>
          <div className="mt-2 text-xs text-gray-600">
            최고 기록: {currentStats.best_streak || currentStats.streak_days}일
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {numberUtils.formatPercentage(currentStats.completion_rate)}
          </div>
          <div className="text-sm text-gray-500">문제 완료율</div>
          <div className="mt-2 text-xs text-gray-600">
            목표: 90% 이상
          </div>
        </div>
      </div>

      {/* 목표 진행률 */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">TOPIK {level}급 목표 달성률</h4>
            <span className="text-sm text-gray-600">
              목표: {config.target}점
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">현재 평균 점수</span>
              <span className="font-medium">{currentStats.average_score.toFixed(1)}점</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-700 ${
                  currentStats.average_score >= config.target 
                    ? 'bg-green-500' 
                    : `bg-${config.color}-600`
                }`}
                style={{ 
                  width: `${Math.min((currentStats.average_score / config.target) * 100, 100)}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0점</span>
              <span className="font-medium">
                {numberUtils.formatPercentage(Math.min((currentStats.average_score / config.target) * 100, 100))} 달성
              </span>
              <span>{config.target}점</span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* 최근 테스트 결과 */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection('recent')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">최근 테스트 결과</span>
                <span className="text-sm text-gray-500">({recentTests.length}개)</span>
              </div>
              
              {expandedSection === 'recent' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'recent' && (
              <div className="px-4 pb-4">
                {recentTests.length > 0 ? (
                  <div className="space-y-3">
                    {recentTests.slice(0, 5).map((test, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            test.score >= 80 
                              ? 'bg-green-100' 
                              : test.score >= 60 
                              ? 'bg-yellow-100' 
                              : 'bg-red-100'
                          }`}>
                            {test.score >= 80 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : test.score >= 60 ? (
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900">
                              TOPIK {test.level || level}급 • {test.type || '종합'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {dateUtils.formatKoreanDate(test.date)} • {test.questions || 10}<T>문제</T>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            test.score >= 80 
                              ? 'text-green-600' 
                              : test.score >= 60 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                          }`}>
                            {test.score}점
                          </div>
                          <div className="text-xs text-gray-500">
                            {numberUtils.formatPercentage(Math.round((test.score / (config.target || 100)) * 100))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">아직 테스트 기록이 없습니다</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 약점 분석 */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection('weaknesses')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">약점 분석</span>
                <span className="text-sm text-gray-500">({weaknesses.length}개)</span>
              </div>
              
              {expandedSection === 'weaknesses' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'weaknesses' && (
              <div className="px-4 pb-4">
                {weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {weaknesses.slice(0, 5).map((weakness, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <span className="text-red-700 text-sm">{weakness.category || weakness}</span>
                        <span className="text-sm text-red-600 font-medium">
                          {weakness.count || Math.floor(Math.random() * 10) + 1}회
                        </span>
                      </div>
                    ))}
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700">
                        💡 <strong>추천:</strong> 가장 자주 틀리는 영역부터 집중 연습해보세요
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">약점 분석을 위한 데이터가 부족합니다</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 성취 현황 */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection('achievements')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">성취 현황</span>
                <span className="text-sm text-gray-500">({achievements.length}개)</span>
              </div>
              
              {expandedSection === 'achievements' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'achievements' && (
              <div className="px-4 pb-4">
                {achievements.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {achievements.map((achievement, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <Award className="w-6 h-6 text-yellow-600" />
                        <div>
                          <div className="font-medium text-yellow-800">
                            {achievement.name || '학습 마일스톤'}
                          </div>
                          <div className="text-sm text-yellow-600">
                            {achievement.description || '꾸준한 학습으로 달성'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">아직 획득한 성취가 없습니다</p>
                    <p className="text-gray-400 text-xs mt-1">꾸준히 학습하면 성취를 얻을 수 있어요!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* 액션 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            🎯 <T>목표까지</T> {Math.max(config.target - currentStats.average_score, 0).toFixed(1)}<T>점 남았어요</T>
          </p>
          
          <Button
            size="sm"
            className={`bg-${config.color}-600 hover:bg-${config.color}-700 flex items-center space-x-2`}
          >
            <Zap className="w-4 h-4" />
            <span><T>연습 이어하기</T></span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;