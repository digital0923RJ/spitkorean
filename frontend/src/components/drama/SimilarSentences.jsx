// src/components/drama/SimilarSentences.jsx
import React, { useState } from 'react';
import { 
  Copy, 
  Volume2, 
  RefreshCw,
  Lightbulb,
  Target,
  Play,
  BookOpen,
  ArrowRight,
  Check,
  Shuffle
} from 'lucide-react';
import Button from '../common/Button';

const SimilarSentences = ({ 
  sentences = [],
  originalSentence = '',
  level = 'beginner',
  onPractice,
  showOriginal = true,
  compact = false
}) => {
  const [playingSentence, setPlayingSentence] = useState(null);
  const [copiedSentence, setCopiedSentence] = useState(null);

  // 레벨별 설정
  const levelConfig = {
    beginner: { 
      expectedCount: 3, 
      color: 'green',
      description: '같은 패턴의 간단한 문장들'
    },
    intermediate: { 
      expectedCount: 5, 
      color: 'blue',
      description: '비슷한 구조의 중급 문장들'
    },
    advanced: { 
      expectedCount: 7, 
      color: 'purple',
      description: '유사한 문법을 사용한 고급 문장들'
    }
  };

  const config = levelConfig[level] || levelConfig.beginner;

  // 기본 유사 문장 (sentences가 비어있을 때)
  const defaultSentences = {
    beginner: [
      '나는 학생이에요.',
      '그는 선생님이에요.',
      '우리는 친구예요.'
    ],
    intermediate: [
      '어제 친구를 만나서 영화를 봤어요.',
      '오늘 시장에 가서 과일을 샀어요.',
      '내일 도서관에 가서 공부할 거예요.'
    ],
    advanced: [
      '회의에서 논의된 사항을 바탕으로 보고서를 작성했습니다.',
      '연구에서 발견된 결과를 토대로 논문을 발표할 예정입니다.',
      '고객이 요청한 내용을 반영하여 제안서를 수정하겠습니다.'
    ]
  };

  // 표시할 문장들
  const sentencesToShow = sentences.length > 0 
    ? sentences 
    : defaultSentences[level] || [];

  // TTS 재생
  const playSentence = async (sentence, index) => {
    if (!sentence || playingSentence === index) return;
    
    setPlayingSentence(index);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'ko-KR';
      utterance.rate = level === 'beginner' ? 0.8 : level === 'intermediate' ? 0.9 : 1.0;
      
      utterance.onend = () => setPlayingSentence(null);
      utterance.onerror = () => setPlayingSentence(null);
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingSentence(null), 2000);
    }
  };

  // 클립보드 복사
  const copySentence = async (sentence, index) => {
    try {
      await navigator.clipboard.writeText(sentence);
      setCopiedSentence(index);
      setTimeout(() => setCopiedSentence(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 문장 연습 시작
  const startPractice = (sentence) => {
    onPractice?.(sentence);
  };

  // 컴팩트 모드
  if (compact) {
    return (
      <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className={`w-4 h-4 text-${config.color}-600`} />
            <h4 className={`text-sm font-medium text-${config.color}-900`}>
              유사 문장 ({sentencesToShow.length}개)
            </h4>
          </div>
        </div>
        
        <div className="space-y-2">
          {sentencesToShow.slice(0, 2).map((sentence, index) => (
            <div key={index} className="flex items-center justify-between bg-white rounded p-2">
              <span className={`text-sm text-${config.color}-800 flex-1`}>
                {sentence}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playSentence(sentence, index)}
                className="p-1"
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {sentencesToShow.length > 2 && (
            <div className={`text-xs text-${config.color}-600 text-center`}>
              +{sentencesToShow.length - 2}개 더...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <Target className={`w-5 h-5 text-${config.color}-600`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">유사 문장</h3>
              <p className="text-sm text-gray-600">
                {config.description} • {sentencesToShow.length}개
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
              {level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '고급'}
            </span>
          </div>
        </div>
      </div>

      {/* 원본 문장 (선택적) */}
      {showOriginal && originalSentence && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">원본 문장</span>
          </div>
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-gray-900 font-medium flex-1">
              {originalSentence}
            </p>
            <div className="flex items-center space-x-1 ml-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playSentence(originalSentence, 'original')}
                disabled={playingSentence === 'original'}
                className="p-2"
              >
                <Volume2 className={`w-4 h-4 ${
                  playingSentence === 'original' 
                    ? 'text-blue-600 animate-pulse' 
                    : 'text-gray-400'
                }`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySentence(originalSentence, 'original')}
                className="p-2"
              >
                <Copy className={`w-4 h-4 ${
                  copiedSentence === 'original' 
                    ? 'text-green-600' 
                    : 'text-gray-400'
                }`} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 유사 문장 목록 */}
      <div className="p-4">
        {sentencesToShow.length > 0 ? (
          <div className="space-y-3">
            {sentencesToShow.map((sentence, index) => (
              <div 
                key={index}
                className="group border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`w-6 h-6 rounded-full bg-${config.color}-100 text-${config.color}-600 text-xs font-medium flex items-center justify-center`}>
                        {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        패턴 {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-900 leading-relaxed">
                      {sentence}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playSentence(sentence, index)}
                      disabled={playingSentence === index}
                      className="p-2"
                      title="발음 듣기"
                    >
                      <Volume2 className={`w-4 h-4 ${
                        playingSentence === index 
                          ? 'text-blue-600 animate-pulse' 
                          : 'text-gray-400'
                      }`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySentence(sentence, index)}
                      className="p-2"
                      title="복사하기"
                    >
                      <Copy className={`w-4 h-4 ${
                        copiedSentence === index 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }`} />
                    </Button>
                    
                    {onPractice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startPractice(sentence)}
                        className="p-2"
                        title="이 문장으로 연습하기"
                      >
                        <Play className="w-4 h-4 text-gray-400" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shuffle className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              유사 문장 생성 중...
            </h4>
            <p className="text-gray-600 text-sm">
              잠시만 기다려주세요
            </p>
          </div>
        )}
      </div>

      {/* 학습 팁 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">학습 팁</h4>
            <p className="text-sm text-gray-600">
              {level === 'beginner' && '단어만 바꿔서 같은 패턴으로 말해보세요. 반복 연습이 중요해요!'}
              {level === 'intermediate' && '문장 구조를 파악하고 다양한 상황에 적용해보세요.'}
              {level === 'advanced' && '복잡한 문법도 패턴을 이해하면 쉽게 활용할 수 있어요.'}
            </p>
          </div>
        </div>
      </div>

      {/* 액션 */}
      {onPractice && sentencesToShow.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 마음에 드는 문장으로 추가 연습하기
            </p>
            
            <Button
              onClick={() => startPractice(sentencesToShow[0])}
              size="sm"
              className={`bg-${config.color}-600 hover:bg-${config.color}-700 flex items-center space-x-2`}
            >
              <span>연습 시작</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarSentences;