// src/components/test/QuestionCard.jsx
import React, { useState } from 'react';
import { 
  Clock, 
  BookOpen, 
  Volume2,
  Flag,
  Check,
  X,
  AlertCircle,
  Bookmark,
  RotateCcw
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card.jsx';
import TranslatableText, { T, TUI, TFeedback } from '../common/TranslatableText.jsx';
import MultipleChoice from './MultipleChoice.jsx';
import { dateUtils } from '../../utils/format.js';

const QuestionCard = ({ 
  question,
  questionNumber,
  totalQuestions,
  level = 3,
  selectedAnswer = null,
  onAnswerSelect,
  showResult = false,
  isCorrect = null,
  explanation = '',
  timeRemaining = null,
  isBookmarked = false,
  onBookmark,
  onReset,
  disabled = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // TOPIK 레벨별 설정
  const levelConfig = {
    1: { color: 'emerald', name: 'TOPIK I - 1급', difficulty: '초급' },
    2: { color: 'emerald', name: 'TOPIK I - 2급', difficulty: '초급' },
    3: { color: 'blue', name: 'TOPIK II - 3급', difficulty: '중급' },
    4: { color: 'blue', name: 'TOPIK II - 4급', difficulty: '중급' },
    5: { color: 'purple', name: 'TOPIK II - 5급', difficulty: '고급' },
    6: { color: 'purple', name: 'TOPIK II - 6급', difficulty: '고급' }
  };

  const config = levelConfig[level] || levelConfig[3];

  // TTS 재생 (듣기 문제용)
  const playAudio = async () => {
    if (!question?.audio_url || isPlaying) return;
    
    setIsPlaying(true);
    
    // 실제로는 question.audio_url을 재생
    // 여기서는 TTS로 대체
    if ('speechSynthesis' in window && question.question) {
      const utterance = new SpeechSynthesisUtterance(question.question);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  // 답안 선택
  const handleAnswerSelect = (optionIndex) => {
    if (disabled || showResult) return;
    onAnswerSelect?.(optionIndex);
  };

  if (!question) {
    return (
      <Card className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <TranslatableText className="text-gray-500">
          문제를 불러오는 중...
        </TranslatableText>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border border-gray-200">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <BookOpen className={`w-5 h-5 text-${config.color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                <TUI>
                  문제 {questionNumber}
                  {totalQuestions && ` / ${totalQuestions}`}
                </TUI>
              </h3>
              <p className="text-sm text-gray-600">
                <TUI>
                  {config.name} • {question.type || '종합'}
                </TUI>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 시간 표시 */}
            {timeRemaining !== null && (
              <div className="flex items-center space-x-1 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={timeRemaining < 60 ? 'text-red-600' : 'text-gray-600'}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            {/* 북마크 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmark?.()}
              className="p-2"
              title="북마크"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            </Button>
            
            {/* 오디오 재생 (듣기 문제) */}
            {(question.type === 'listening' || question.audio_url) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={playAudio}
                disabled={isPlaying}
                className="p-2"
                title="음성 재생"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
              </Button>
            )}
            
            {/* 다시 시도 */}
            {showResult && onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReset?.()}
                className="p-2"
                title="다시 시도"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 문제 본문 */}
      <div className="p-6">
        {/* 문제 텍스트 */}
        <div className="mb-6">
          <div className="text-lg font-medium text-gray-900 leading-relaxed">
            <TranslatableText>
              {question.question}
            </TranslatableText>
          </div>
          
          {/* 지문 (있는 경우) */}
          {question.passage && (
            <Card className="mt-4 bg-gray-50 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                <TUI>지문</TUI>
              </div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                <TranslatableText>
                  {question.passage}
                </TranslatableText>
              </div>
            </Card>
          )}
          
          {/* 이미지 (있는 경우) */}
          {question.image_url && (
            <div className="mt-4">
              <img 
                src={question.image_url} 
                alt="문제 이미지"
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* 선택지 - MultipleChoice 컴포넌트 사용 */}
        <MultipleChoice
          options={question.options || []}
          selectedAnswer={selectedAnswer}
          correctAnswer={question.answer}
          onSelect={handleAnswerSelect}
          showResult={showResult}
          disabled={disabled}
          layout="vertical"
          size="medium"
          showLetters={true}
          playAudio={(text, index) => {
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = 'ko-KR';
              utterance.rate = 0.8;
              speechSynthesis.speak(utterance);
            }
          }}
        />

        {/* 결과 표시 */}
        {showResult && (
          <Card className="mt-6 border">
            <div className="flex items-center space-x-2 mb-3">
              {isCorrect ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">
                    <TFeedback>정답입니다!</TFeedback>
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-700">
                    <TFeedback>틀렸습니다</TFeedback>
                  </span>
                </>
              )}
            </div>
            
            {/* 정답 표시 */}
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">
                <TUI>정답:</TUI>
              </span>{' '}
              {String.fromCharCode(65 + question.answer)} - {question.options[question.answer]}
            </div>
            
            {/* 해설 */}
            {explanation && (
              <div className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium">
                  <TUI>해설:</TUI>
                </span>{' '}
                <TFeedback>
                  {explanation}
                </TFeedback>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* 하단 메타 정보 */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <T>{config.difficulty}</T>
            {question.category && (
              <T>{question.category}</T>
            )}
            {question.estimated_time && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <T>
                  {question.estimated_time}분
                </T>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {question.difficulty_score && (
              <T>
                난이도 {question.difficulty_score}/10
              </T>
            )}
            
            {showResult && question.xp_reward && (
              <span className="text-yellow-600">+{question.xp_reward} XP</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;