import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Zap, 
  AlertTriangle,
  ThumbsUp,
  Cloud,
  Sparkles
} from 'lucide-react';

const EmotionIndicator = ({ 
  emotion = null, 
  size = 'md', 
  showLabel = true,
  showConfidence = true,
  animated = true,
  className = '' 
}) => {
  // 상태 관리
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  // 사이즈 설정
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  // 감정별 아이콘 및 색상 매핑
  const emotionConfig = {
    happy: {
      icon: Smile,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      label: '기쁨',
      description: '긍정적이고 밝은 감정'
    },
    sad: {
      icon: Frown,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      label: '슬픔',
      description: '조금 슬프거나 우울한 감정'
    },
    angry: {
      icon: Zap,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      label: '화남',
      description: '분노하거나 짜증나는 감정'
    },
    surprised: {
      icon: AlertTriangle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      label: '놀람',
      description: '깜짝 놀라거나 당황한 감정'
    },
    fearful: {
      icon: Cloud,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-200',
      label: '불안',
      description: '걱정되거나 두려운 감정'
    },
    disgusted: {
      icon: Frown,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      label: '싫음',
      description: '역겹거나 불쾌한 감정'
    },
    neutral: {
      icon: Meh,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      label: '중립',
      description: '평온하고 중립적인 감정'
    },
    excited: {
      icon: Sparkles,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100',
      borderColor: 'border-pink-200',
      label: '흥분',
      description: '신나고 들뜬 감정'
    },
    grateful: {
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-100',
      borderColor: 'border-rose-200',
      label: '감사',
      description: '고마워하는 감정'
    },
    confident: {
      icon: ThumbsUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200',
      label: '자신감',
      description: '확신에 찬 감정'
    }
  };

  // 감정 정보 가져오기
  const getEmotionInfo = () => {
    if (!emotion || !emotion.emotion) {
      return emotionConfig.neutral;
    }
    return emotionConfig[emotion.emotion] || emotionConfig.neutral;
  };

  const emotionInfo = getEmotionInfo();
  const confidence = emotion?.confidence ? Math.round(emotion.confidence * 100) : 0;

  // 애니메이션 효과
  useEffect(() => {
    if (emotion && animated) {
      setIsVisible(false);
      setAnimationClass('opacity-0 scale-75');
      
      setTimeout(() => {
        setIsVisible(true);
        setAnimationClass('opacity-100 scale-100');
      }, 100);
    } else {
      setIsVisible(true);
      setAnimationClass('opacity-100 scale-100');
    }
  }, [emotion, animated]);

  // 신뢰도에 따른 투명도 계산
  const getOpacity = () => {
    if (!showConfidence || !confidence) return 1;
    return Math.max(0.4, confidence / 100);
  };

  // 감정이 없으면 렌더링하지 않음
  if (!emotion && size !== 'placeholder') {
    return null;
  }

  const IconComponent = emotionInfo.icon;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      
      {/* 감정 아이콘 */}
      <div className={`
        relative flex items-center justify-center rounded-full transition-all duration-300
        ${emotionInfo.bgColor} ${emotionInfo.borderColor} border
        ${animated ? animationClass : ''}
        ${size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : size === 'xl' ? 'p-4' : 'p-2'}
      `}
      style={{ opacity: getOpacity() }}
      title={`${emotionInfo.label} (${confidence}%)`}
      >
        <IconComponent className={`${iconSize} ${emotionInfo.color}`} />
        
        {/* 신뢰도 링 */}
        {showConfidence && confidence > 0 && size !== 'sm' && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-current text-gray-200"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`stroke-current ${emotionInfo.color}`}
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${confidence}, 100`}
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 감정 레이블 */}
      {showLabel && (
        <div className="flex flex-col">
          <div className={`text-sm font-medium ${emotionInfo.color}`}>
            {emotionInfo.label}
          </div>
          
          {/* 신뢰도 표시 */}
          {showConfidence && confidence > 0 && (
            <div className="text-xs text-gray-500">
              {confidence}% 확신
            </div>
          )}
          
          {/* 감정 설명 (큰 사이즈일 때만) */}
          {size === 'xl' && (
            <div className="text-xs text-gray-400 mt-1 max-w-32">
              {emotionInfo.description}
            </div>
          )}
        </div>
      )}

      {/* 감정 변화 애니메이션 (특별한 감정일 때) */}
      {animated && emotion?.emotion === 'excited' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
          <div className="absolute top-1 right-0 w-1 h-1 bg-pink-400 rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
        </div>
      )}
    </div>
  );
};

// 감정 히스토리를 표시하는 컴포넌트
export const EmotionHistory = ({ emotions = [], className = '' }) => {
  const recentEmotions = emotions.slice(-5); // 최근 5개만

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-xs text-gray-500 mr-2">감정 변화:</span>
      {recentEmotions.map((emotion, index) => (
        <EmotionIndicator
          key={index}
          emotion={emotion}
          size="sm"
          showLabel={false}
          showConfidence={false}
          animated={false}
        />
      ))}
    </div>
  );
};

// 감정 통계를 표시하는 컴포넌트
export const EmotionStats = ({ emotions = [], className = '' }) => {
  // 감정별 카운트 계산
  const emotionCounts = emotions.reduce((acc, emotion) => {
    const emotionType = emotion?.emotion || 'neutral';
    acc[emotionType] = (acc[emotionType] || 0) + 1;
    return acc;
  }, {});

  // 가장 많은 감정 찾기
  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (!dominantEmotion) {
    return null;
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">오늘의 감정</h4>
      <div className="flex items-center space-x-2">
        <EmotionIndicator
          emotion={{ emotion: dominantEmotion[0], confidence: 1 }}
          size="md"
          showLabel={true}
          showConfidence={false}
        />
        <span className="text-xs text-gray-500">
          {dominantEmotion[1]}회 감지
        </span>
      </div>
    </div>
  );
};

export default EmotionIndicator;