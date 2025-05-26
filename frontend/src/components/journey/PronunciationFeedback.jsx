import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Volume2, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Target,
  RefreshCw,
  PlayCircle,
  Award,
  Star,
  Info,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Button from '../common/Button';

// 유틸리티 import
import { numberUtils } from '../../utils/format.js';

// 컴포넌트 import
import Card from '../common/Card.jsx';
import TranslatableText, { T } from '../common/TranslatableText.jsx';

const PronunciationFeedback = ({ 
  score = null, 
  analysis = null,
  suggestions = [],
  originalText = '',
  transcribedText = '',
  onRetry = null,
  onPlayReference = null,
  showDetailed = true,
  className = '' 
}) => {
  // 상태 관리
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  // 점수 등급 계산
  const getScoreGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'green', label: '완벽' };
    if (score >= 80) return { grade: 'B', color: 'blue', label: '우수' };
    if (score >= 70) return { grade: 'C', color: 'yellow', label: '양호' };
    if (score >= 60) return { grade: 'D', color: 'orange', label: '개선필요' };
    return { grade: 'F', color: 'red', label: '재연습필요' };
  };

  // 애니메이션 효과
  useEffect(() => {
    if (score !== null) {
      setAnimationClass('opacity-0 scale-95');
      setTimeout(() => {
        setAnimationClass('opacity-100 scale-100');
      }, 100);
    }
  }, [score]);

  // 발음 분석 데이터 구조
  const pronunciationAnalysis = analysis || {
    strengths: [
      '전체적인 발음이 명확합니다',
      '한국어 리듬감이 좋습니다'
    ],
    weaknesses: [
      'ㅓ와 ㅗ 구분에 주의가 필요합니다',
      '받침 발음을 더 명확하게 해보세요'
    ],
    improvements: [
      '입술 모양에 더 신경써보세요',
      '천천히 또박또박 연습해보세요'
    ]
  };

  const scoreInfo = score !== null ? getScoreGrade(score) : null;

  // 점수가 없으면 렌더링하지 않음
  if (score === null) {
    return null;
  }

  return (
    <Card 
      className={`transition-all duration-300 ${animationClass} ${className}`}
      shadow="lg"
    >
      
      {/* 메인 점수 표시 */}
      <div className="p-6 text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-4 ${
          scoreInfo.color === 'green' ? 'bg-green-50 border-green-200' :
          scoreInfo.color === 'blue' ? 'bg-blue-50 border-blue-200' :
          scoreInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          scoreInfo.color === 'orange' ? 'bg-orange-50 border-orange-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              scoreInfo.color === 'green' ? 'text-green-600' :
              scoreInfo.color === 'blue' ? 'text-blue-600' :
              scoreInfo.color === 'yellow' ? 'text-yellow-600' :
              scoreInfo.color === 'orange' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {score}
            </div>
            <div className={`text-xs font-medium ${
              scoreInfo.color === 'green' ? 'text-green-600' :
              scoreInfo.color === 'blue' ? 'text-blue-600' :
              scoreInfo.color === 'yellow' ? 'text-yellow-600' :
              scoreInfo.color === 'orange' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {scoreInfo.grade}
            </div>
          </div>
        </div>

        <h3 className={`text-xl font-semibold mb-2 ${
          scoreInfo.color === 'green' ? 'text-green-600' :
          scoreInfo.color === 'blue' ? 'text-blue-600' :
          scoreInfo.color === 'yellow' ? 'text-yellow-600' :
          scoreInfo.color === 'orange' ? 'text-orange-600' :
          'text-red-600'
        }`}>
          <T>{scoreInfo.label}</T>!
        </h3>

        <p className="text-gray-600 mb-4">
          <T>발음 정확도</T> {score}<T>점을 받았습니다</T>
        </p>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-center space-x-3">
          {onPlayReference && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayReference}
              className="flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <T>정확한 발음</T>
            </Button>
          )}

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <T>다시 녹음</T>
            </Button>
          )}

          {showDetailed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center space-x-2"
            >
              <Info className="w-4 h-4" />
              <T>{showAnalysis ? '간단히' : '자세히'}</T>
            </Button>
          )}
        </div>
      </div>

      {/* 원문 vs 인식된 텍스트 비교 */}
      {(originalText || transcribedText) && (
        <div className="border-t border-gray-200 px-6 py-4">
          <h4 className="font-medium text-gray-900 mb-3">
            <T>인식 결과</T>
          </h4>
          
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600 mb-1">
                <T>원문</T>
              </div>
              <div className="text-blue-900 font-medium">{originalText}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">
                <T>인식된 내용</T>
              </div>
              <div className="text-gray-900 font-medium">
                {transcribedText || <T>음성을 인식하지 못했습니다</T>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 분석 */}
      {showAnalysis && showDetailed && (
        <div className="border-t border-gray-200 px-6 py-4 space-y-4">
          
          {/* 잘한 점 */}
          {pronunciationAnalysis.strengths?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-900">
                  <T>잘한 점</T>
                </h4>
              </div>
              <ul className="space-y-1">
                {pronunciationAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-start space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <T>{strength}</T>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 개선점 */}
          {pronunciationAnalysis.weaknesses?.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <h4 className="font-medium text-orange-900">
                  <T>개선점</T>
                </h4>
              </div>
              <ul className="space-y-1">
                {pronunciationAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-orange-800 flex items-start space-x-2">
                    <Target className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                    <T>{weakness}</T>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 연습 방법 */}
          {pronunciationAnalysis.improvements?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">
                  <T>연습 방법</T>
                </h4>
              </div>
              <ul className="space-y-1">
                {pronunciationAnalysis.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start space-x-2">
                    <PlayCircle className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <T>{improvement}</T>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 빠른 피드백 */}
      {!showAnalysis && suggestions.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <h4 className="font-medium text-gray-900 mb-3">
            <T>빠른 팁</T>
          </h4>
          <div className="space-y-2">
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <T>{suggestion}</T>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 점수별 격려 메시지 */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="text-center">
          {score >= 90 ? (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">
                <T>완벽한 발음입니다</T>! 🎉
              </span>
            </div>
          ) : score >= 80 ? (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                <T>훌륭해요! 조금만 더 연습하면 완벽해집니다</T>!
              </span>
            </div>
          ) : score >= 70 ? (
            <div className="flex items-center justify-center space-x-2 text-yellow-600">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">
                <T>좋은 진전이에요! 계속 연습해보세요</T>!
              </span>
            </div>
          ) : score >= 60 ? (
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">
                <T>아직 연습이 더 필요해요. 천천히 해보세요</T>!
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">
                <T>다시 한 번 또박또박 발음해보세요</T>!
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// 발음 히스토리를 표시하는 컴포넌트
export const PronunciationHistory = ({ 
  scores = [], 
  onSelectScore = null,
  className = '' 
}) => {
  if (scores.length === 0) return null;

  return (
    <Card className={className} padding="default">
      <h4 className="font-medium text-gray-900 mb-3">
        <T>최근 발음 점수</T>
      </h4>
      <div className="space-y-2">
        {scores.slice(-5).map((score, index) => {
          const scoreInfo = numberUtils.formatScore(score);
          
          return (
            <div 
              key={index}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                onSelectScore ? 'hover:bg-gray-50' : ''
              }`}
              onClick={() => onSelectScore && onSelectScore(score, index)}
            >
              <span className="text-sm text-gray-600">
                <T>시도</T> {index + 1}
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${scoreInfo.bg.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                <span className="text-sm font-medium">{scoreInfo.text}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {scores.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span><T>평균 점수</T></span>
            <span className="font-medium">
              {Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)}<T>점</T>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

// 발음 통계를 표시하는 컴포넌트
export const PronunciationStats = ({ 
  stats = {},
  className = '' 
}) => {
  const {
    totalAttempts = 0,
    averageScore = 0,
    bestScore = 0,
    improvementRate = 0
  } = stats;

  return (
    <Card 
      className={`bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}
      padding="default"
    >
      <h4 className="font-medium text-gray-900 mb-4">
        <T>발음 학습 통계</T>
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {numberUtils.formatNumber(totalAttempts)}
          </div>
          <div className="text-xs text-gray-600">
            <T>총 연습 횟수</T>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(averageScore)}
          </div>
          <div className="text-xs text-gray-600">
            <T>평균 점수</T>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(bestScore)}
          </div>
          <div className="text-xs text-gray-600">
            <T>최고 점수</T>
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvementRate > 0 ? '+' : ''}{numberUtils.formatPercentage(improvementRate)}
          </div>
          <div className="text-xs text-gray-600">
            <T>향상도</T>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PronunciationFeedback;