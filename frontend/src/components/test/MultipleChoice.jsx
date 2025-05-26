// src/components/test/MultipleChoice.jsx
import { useState } from 'react';
import { 
  Check, 
  X, 
  Volume2,
  Lightbulb,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import Button from '../common/Button';

const MultipleChoice = ({ 
  options = [],
  selectedAnswer = null,
  correctAnswer = null,
  onSelect,
  showResult = false,
  showFeedback = true,
  disabled = false,
  layout = 'vertical', // 'vertical' | 'horizontal' | 'grid'
  size = 'medium', // 'small' | 'medium' | 'large'
  allowDeselect = false,
  playAudio = null,
  showLetters = true
}) => {
  const [hoveringOption, setHoveringOption] = useState(null);

  // 크기별 스타일 설정
  const sizeConfig = {
    small: {
      padding: 'p-2',
      fontSize: 'text-sm',
      iconSize: 'w-4 h-4',
      radioSize: 'w-4 h-4'
    },
    medium: {
      padding: 'p-4',
      fontSize: 'text-base',
      iconSize: 'w-5 h-5',
      radioSize: 'w-5 h-5'
    },
    large: {
      padding: 'p-6',
      fontSize: 'text-lg',
      iconSize: 'w-6 h-6',
      radioSize: 'w-6 h-6'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // 레이아웃별 그리드 클래스
  const layoutClasses = {
    vertical: 'space-y-3',
    horizontal: 'flex flex-wrap gap-3',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-3'
  };

  // 옵션 선택 처리
  const handleSelect = (optionIndex) => {
    if (disabled) return;
    
    // 선택 해제 허용하고 이미 선택된 옵션을 클릭한 경우
    if (allowDeselect && selectedAnswer === optionIndex) {
      onSelect?.(null);
    } else {
      onSelect?.(optionIndex);
    }
  };

  // 옵션 스타일 결정
  const getOptionStyle = (optionIndex) => {
    const baseClasses = `w-full ${config.padding} text-left border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`;
    
    if (disabled) {
      return `${baseClasses} cursor-not-allowed opacity-60 bg-gray-50 border-gray-200`;
    }

    if (!showResult) {
      // 일반 선택 모드
      if (selectedAnswer === optionIndex) {
        return `${baseClasses} border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200`;
      } else if (hoveringOption === optionIndex) {
        return `${baseClasses} border-gray-400 bg-gray-50 cursor-pointer`;
      } else {
        return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer`;
      }
    } else {
      // 결과 표시 모드
      if (optionIndex === correctAnswer) {
        return `${baseClasses} border-green-500 bg-green-50 text-green-700`;
      } else if (selectedAnswer === optionIndex && selectedAnswer !== correctAnswer) {
        return `${baseClasses} border-red-500 bg-red-50 text-red-700`;
      } else {
        return `${baseClasses} border-gray-200 bg-gray-50 text-gray-500`;
      }
    }
  };

  // 옵션 아이콘 결정
  const getOptionIcon = (optionIndex) => {
    if (!showResult) {
      // 일반 선택 모드
      return selectedAnswer === optionIndex ? (
        <div className="bg-blue-500 rounded-full flex items-center justify-center w-5 h-5">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      );
    } else {
      // 결과 표시 모드
      if (optionIndex === correctAnswer) {
        return <Check className="w-5 h-5 text-green-600" />;
      } else if (selectedAnswer === optionIndex && selectedAnswer !== correctAnswer) {
        return <X className="w-5 h-5 text-red-600" />;
      } else {
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
      }
    }
  };

  // 옵션 라벨 (A, B, C, D)
  const getOptionLabel = (index) => {
    return showLetters ? String.fromCharCode(65 + index) : (index + 1).toString();
  };

  // TTS 재생
  const handlePlayAudio = (optionText, optionIndex) => {
    if (playAudio) {
      playAudio(optionText, optionIndex);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(optionText);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!options || options.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">선택지가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 선택지 목록 */}
      <div className={layoutClasses[layout]}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            onMouseEnter={() => setHoveringOption(index)}
            onMouseLeave={() => setHoveringOption(null)}
            className={getOptionStyle(index)}
            disabled={disabled}
          >
            <div className="flex items-start space-x-3">
              {/* 선택 아이콘 */}
              <div className="flex-shrink-0 mt-0.5">
                {getOptionIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    {/* 옵션 라벨 */}
                    <span className={`font-medium ${config.fontSize} flex-shrink-0`}>
                      {getOptionLabel(index)}.
                    </span>
                    
                    {/* 옵션 텍스트 */}
                    <span className={`${config.fontSize} flex-1 text-left`}>
                      {option}
                    </span>
                  </div>
                  
                  {/* TTS 버튼 */}
                  {playAudio !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(option, index);
                      }}
                      className="p-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 피드백 메시지 */}
      {showFeedback && showResult && (
        <div className="space-y-3">
          {selectedAnswer === correctAnswer ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">정답입니다!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                훌륭해요! 올바른 답을 선택했습니다.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">틀렸습니다</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                정답은 <span className="font-medium">{getOptionLabel(correctAnswer)}</span>번 입니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 도움말 (결과 표시 전) */}
      {!showResult && !disabled && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-3 h-3" />
            <span>답을 선택해주세요</span>
          </div>
          
          {selectedAnswer !== null && allowDeselect && (
            <span>선택 해제하려면 다시 클릭하세요</span>
          )}
        </div>
      )}

      {/* 리셋 버튼 */}
      {!showResult && selectedAnswer !== null && !disabled && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect?.(null)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>선택 초기화</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;