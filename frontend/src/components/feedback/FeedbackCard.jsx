// src/components/feedback/FeedbackCard.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  Clock,
  Volume2,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const FeedbackCard = ({
  type = 'general', // 'pronunciation', 'grammar', 'conversation', 'test', 'general'
  score = null,
  isCorrect = null,
  title,
  subtitle,
  feedback = {},
  level = 'beginner',
  showDetails = true,
  onPlayAudio = null,
  onRetry = null,
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  // 타입별 설정
  const typeConfig = {
    pronunciation: {
      icon: Volume2,
      color: 'blue',
      title: '발음 평가',
      scoreLabel: '정확도'
    },
    grammar: {
      icon: BookOpen,
      color: 'green',
      title: '문법 분석',
      scoreLabel: '문법 점수'
    },
    conversation: {
      icon: Target,
      color: 'purple',
      title: '대화 평가',
      scoreLabel: '자연스러움'
    },
    test: {
      icon: Award,
      color: 'orange',
      title: '시험 결과',
      scoreLabel: '점수'
    },
    general: {
      icon: Star,
      color: 'indigo',
      title: '학습 피드백',
      scoreLabel: '평가'
    }
  };

  const config = typeConfig[type] || typeConfig.general;
  const IconComponent = config.icon;

  // 점수에 따른 색상 결정
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 점수에 따른 배경색
  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // 정답/오답에 따른 스타일
  const getCorrectStyle = () => {
    if (isCorrect === true) return 'border-green-500 bg-green-50';
    if (isCorrect === false) return 'border-red-500 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <Card 
      className={`${className} ${getCorrectStyle()}`}
      shadow="md"
      {...props}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
            <IconComponent className={`w-5 h-5 text-${config.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title || config.title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>

        {/* 정답/오답 표시 */}
        {isCorrect !== null && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
            isCorrect 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isCorrect ? '정답' : '오답'}
            </span>
          </div>
        )}
      </div>

      {/* 점수 표시 */}
      {score !== null && (
        <div className={`p-4 rounded-lg border mb-4 ${getScoreBgColor(score)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {config.scoreLabel}
            </span>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
          
          {/* 점수 바 */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                score >= 90 ? 'bg-green-500' :
                score >= 70 ? 'bg-blue-500' :
                score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      )}

      {/* 피드백 요약 */}
      {feedback.summary && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            {feedback.summary}
          </p>
        </div>
      )}

      {/* 강점과 약점 */}
      {(feedback.strengths || feedback.weaknesses) && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* 강점 */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">잘한 점</span>
              </div>
              <ul className="space-y-1">
                {feedback.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="text-xs text-green-600 flex items-start">
                    <span className="text-green-500 mr-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 약점 */}
          {feedback.weaknesses && feedback.weaknesses.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">개선점</span>
              </div>
              <ul className="space-y-1">
                {feedback.weaknesses.slice(0, 3).map((weakness, index) => (
                  <li key={index} className="text-xs text-red-600 flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 개선 사항 */}
      {feedback.improvements && feedback.improvements.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>개선 방법</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {feedback.improvements.map((improvement, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{improvement}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {/* 오디오 재생 */}
          {onPlayAudio && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlayAudio(feedback.text || title)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              듣기
            </Button>
          )}
          
          {/* 시간 표시 */}
          {feedback.timestamp && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(feedback.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>

        {/* 다시 시도 */}
        {onRetry && (
          <Button
            onClick={() => onRetry()}
            size="sm"
            className={`bg-${config.color}-600 hover:bg-${config.color}-700`}
          >
            다시 시도
          </Button>
        )}
      </div>

      {/* XP 보상 표시 */}
      {feedback.xpEarned && feedback.xpEarned > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              +{feedback.xpEarned} XP 획득!
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FeedbackCard;