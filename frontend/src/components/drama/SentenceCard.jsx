// src/components/drama/SentenceCard.jsx
import React, { useState } from 'react';
import { 
  Play, 
  Volume2, 
  Check, 
  Star,
  BookOpen,
  Target,
  Zap,
  Clock,
  Award
} from 'lucide-react';
import Button from '../common/Button';

const SentenceCard = ({ 
  sentence,
  level = 'beginner',
  isCompleted = false,
  accuracy = null,
  onStart,
  onRetry,
  showActions = true,
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // 난이도 표시 설정
  const difficultyConfig = {
    beginner: { 
      color: 'green', 
      stars: 1, 
      label: '초급',
      description: '3-5 단어 문장' 
    },
    intermediate: { 
      color: 'blue', 
      stars: 3, 
      label: '중급',
      description: '7-10 단어 문장' 
    },
    advanced: { 
      color: 'purple', 
      stars: 5, 
      label: '고급',
      description: '12+ 단어 복잡한 문장' 
    }
  };

  const config = difficultyConfig[level] || difficultyConfig.beginner;

  // TTS 재생
  const playAudio = async () => {
    if (!sentence?.content || isPlaying) return;
    
    setIsPlaying(true);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sentence.content);
      utterance.lang = 'ko-KR';
      utterance.rate = level === 'beginner' ? 0.7 : level === 'intermediate' ? 0.9 : 1.0;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  // 정확도 색상
  const getAccuracyColor = (acc) => {
    if (acc >= 90) return 'text-green-600';
    if (acc >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 컴팩트 모드
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {sentence.content}
            </p>
            {sentence.translation && (
              <p className="text-xs text-gray-500 truncate">
                {sentence.translation}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-3">
            {isCompleted && (
              <div className="flex items-center space-x-1">
                <Check className="w-4 h-4 text-green-600" />
                {accuracy !== null && (
                  <span className={`text-xs font-medium ${getAccuracyColor(accuracy)}`}>
                    {accuracy}%
                  </span>
                )}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              disabled={isPlaying}
              className="p-1"
            >
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-blue-600' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* 드라마 정보 */}
            {sentence.drama_title && (
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">
                  {sentence.drama_title}
                </span>
              </div>
            )}
            
            {/* 난이도 표시 */}
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                {config.label}
              </span>
              
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < config.stars 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* 완료 상태 */}
          {isCompleted && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">완료</span>
              </div>
              {accuracy !== null && (
                <div className={`text-sm font-bold ${getAccuracyColor(accuracy)}`}>
                  {accuracy}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4">
        {/* 한국어 문장 */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <p className="text-lg font-medium text-gray-900 leading-relaxed flex-1">
              {sentence.content}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              disabled={isPlaying}
              className="ml-3 p-2"
            >
              <Volume2 className={`w-5 h-5 ${isPlaying ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>

        {/* 번역 */}
        {sentence.translation && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">의미:</span> {sentence.translation}
            </p>
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>{config.description}</span>
          </div>
          
          {sentence.grammar_points && sentence.grammar_points.length > 0 && (
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{sentence.grammar_points.length}개 문법 포인트</span>
            </div>
          )}
          
          {sentence.xp_reward && (
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>+{sentence.xp_reward} XP</span>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        {showActions && (
          <div className="flex space-x-3">
            {!isCompleted ? (
              <Button
                onClick={() => onStart?.(sentence)}
                className={`flex-1 bg-${config.color}-600 hover:bg-${config.color}-700 flex items-center justify-center space-x-2`}
              >
                <Play className="w-4 h-4" />
                <span>연습 시작</span>
              </Button>
            ) : (
              <div className="flex space-x-2 w-full">
                <Button
                  onClick={() => onRetry?.(sentence)}
                  variant="outline"
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>다시 연습</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>마스터 모드</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 푸터 - 추가 정보 */}
      {(sentence.category || sentence.difficulty_score) && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {sentence.category && (
              <span className="px-2 py-1 bg-white rounded">
                {sentence.category}
              </span>
            )}
            
            {sentence.difficulty_score && (
              <span>
                난이도 {sentence.difficulty_score}/10
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentenceCard;