// src/components/drama/SentenceBuilder.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  RotateCcw, 
  Check, 
  Lightbulb, 
  Volume2,
  Target,
  ArrowRight,
  Shuffle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../common/Buttom.jsx';
import SentenceCard from './SentenceCard.jsx';
import GrammarTips from './GrammarTips.jsx';
import SimilarSentences from './SimilarSentences.jsx';

// Redux 액션들
import { 
  fetchDramaSentences,
  submitSentenceAnswer,
  setCurrentSentence,
  initializeSentenceBuilder,
  resetSentenceBuilder,
  addWordToAnswer,
  removeWordFromAnswer,
  toggleHint,
  nextSentence,
  previousSentence,
  selectCurrentSentence,
  selectShuffledWords,
  selectUserAnswer,
  selectShowHint,
  selectIsCorrect,
  selectShowResult,
  selectSimilarSentences,
  selectGrammarPoints,
  selectDramaLoading,
  selectCanSubmitAnswer,
  selectHasNextSentence,
  selectHasPreviousSentence
} from '../../store/slices/dramaSlice.js';

// 드래그 앤 드롭 아이템 타입
const ItemType = {
  WORD: 'word'
};

// 드래그 가능한 단어 컴포넌트
const DraggableWord = ({ word, source, onMove, disabled }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.WORD,
    item: { word, source },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = () => {
    if (!disabled) {
      onMove(word, source);
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`px-3 py-2 rounded-lg border transition-all cursor-pointer ${
        source === 'words' 
          ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
          : 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {word.text}
    </div>
  );
};

// 드롭 영역 컴포넌트
const DropZone = ({ children, onDrop, targetArea, disabled, className = '' }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemType.WORD,
    drop: (item) => {
      if (!disabled) {
        onDrop(item.word, item.source, targetArea);
      }
    },
    canDrop: () => !disabled,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`${className} ${
        isOver && canDrop ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}
    >
      {children}
    </div>
  );
};

const SentenceBuilder = ({ 
  level: propLevel = 'beginner',
  onComplete,
  showActions = true
}) => {
  const dispatch = useDispatch();
  
  // Redux 상태 구독
  const currentSentence = useSelector(selectCurrentSentence);
  const shuffledWords = useSelector(selectShuffledWords);
  const userAnswer = useSelector(selectUserAnswer);
  const showHint = useSelector(selectShowHint);
  const isCorrect = useSelector(selectIsCorrect);
  const showResult = useSelector(selectShowResult);
  const similarSentences = useSelector(selectSimilarSentences);
  const grammarPoints = useSelector(selectGrammarPoints);
  const loading = useSelector(selectDramaLoading);
  const canSubmitAnswer = useSelector(selectCanSubmitAnswer);
  const hasNextSentence = useSelector(selectHasNextSentence);
  const hasPreviousSentence = useSelector(selectHasPreviousSentence);

  // 컴포넌트 초기화
  useEffect(() => {
    if (currentSentence && !showResult) {
      dispatch(initializeSentenceBuilder());
    }
  }, [currentSentence, dispatch]);

  // 단어 이동 처리
  const handleWordMove = (word, source, targetArea = null) => {
    if (loading.checking) return;

    if (source === 'words' && (targetArea === 'answer' || targetArea === null)) {
      dispatch(addWordToAnswer(word));
    } else if (source === 'answer' && (targetArea === 'words' || targetArea === null)) {
      const answerIndex = userAnswer.findIndex(w => w.id === word.id);
      if (answerIndex !== -1) {
        dispatch(removeWordFromAnswer(answerIndex));
      }
    }
  };

  // 답안 제출
  const handleSubmitAnswer = async () => {
    if (!canSubmitAnswer || !currentSentence) return;

    const userSentence = userAnswer.map(word => word.text).join(' ');
    
    try {
      await dispatch(submitSentenceAnswer({
        sentence_id: currentSentence.id,
        drama_id: currentSentence.drama_id,
        user_answer: userSentence,
        level: propLevel
      })).unwrap();

      // 외부 콜백 호출
      onComplete?.(userSentence, userAnswer);
    } catch (error) {
      console.error('답안 제출 실패:', error);
    }
  };

  // 힌트 토글
  const handleToggleHint = () => {
    dispatch(toggleHint());
  };

  // 리셋
  const handleReset = () => {
    dispatch(resetSentenceBuilder());
  };

  // 다음/이전 문장
  const handleNextSentence = () => {
    dispatch(nextSentence());
  };

  const handlePreviousSentence = () => {
    dispatch(previousSentence());
  };

  // TTS 재생
  const playAudio = () => {
    if (!currentSentence?.content || loading.checking) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentSentence.content);
      utterance.lang = 'ko-KR';
      utterance.rate = propLevel === 'beginner' ? 0.7 : propLevel === 'intermediate' ? 0.9 : 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  // 다시 연습하기
  const handlePracticeAgain = () => {
    dispatch(resetSentenceBuilder());
  };

  if (!currentSentence) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500">문장을 선택해주세요</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* 메인 문장 구성 영역 */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">문장 구성하기</h3>
            </div>
            
            {/* 번역 및 드라마 정보 */}
            {currentSentence.translation && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">의미:</p>
                <p className="text-gray-800">"{currentSentence.translation}"</p>
              </div>
            )}
            
            {currentSentence.drama_title && (
              <div className="text-sm text-purple-600 mb-4">
                📺 {currentSentence.drama_title}
              </div>
            )}
          </div>

          {/* 힌트 표시 */}
          {showHint && currentSentence.content && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">힌트</span>
              </div>
              <p className="text-sm text-yellow-700">
                첫 번째 단어: <span className="font-medium">{currentSentence.content.split(' ')[0]}</span>
              </p>
            </div>
          )}

          {/* 답안 구성 영역 */}
          <div className="space-y-4">
            {/* 사용자 답안 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구성한 문장
              </label>
              <DropZone
                onDrop={handleWordMove}
                targetArea="answer"
                disabled={loading.checking || showResult}
                className={`min-h-[60px] p-4 border-2 border-dashed rounded-lg bg-gray-50 flex flex-wrap gap-2 items-start transition-colors ${
                  loading.checking || showResult ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              >
                {userAnswer.length > 0 ? (
                  userAnswer.map((word, index) => (
                    <DraggableWord
                      key={`answer-${word.id}`}
                      word={word}
                      source="answer"
                      onMove={(w, s) => handleWordMove(w, s, 'words')}
                      disabled={loading.checking || showResult}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 italic w-full text-center py-4">
                    {loading.checking || showResult ? '답안이 제출되었습니다' : '여기에 단어를 드래그하거나 클릭하세요'}
                  </p>
                )}
              </DropZone>
            </div>

            {/* 단어 선택 영역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용할 단어들
              </label>
              <DropZone
                onDrop={handleWordMove}
                targetArea="words"
                disabled={loading.checking || showResult}
                className={`min-h-[60px] p-4 border rounded-lg bg-white flex flex-wrap gap-2 transition-colors ${
                  loading.checking || showResult ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              >
                {shuffledWords.map((word) => (
                  <DraggableWord
                    key={`word-${word.id}`}
                    word={word}
                    source="words"
                    onMove={(w, s) => handleWordMove(w, s, 'answer')}
                    disabled={loading.checking || showResult}
                  />
                ))}
              </DropZone>
            </div>
          </div>

          {/* 결과 표시 */}
          {showResult && isCorrect !== null && (
            <div className={`p-4 rounded-lg border ${
              isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Target className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? '정답입니다!' : '다시 시도해보세요'}
                </span>
              </div>
              
              {!isCorrect && (
                <div className="text-sm text-red-700">
                  <p>정답: <span className="font-medium">{currentSentence.content}</span></p>
                  <p>작성한 답: <span className="font-medium">{userAnswer.map(w => w.text).join(' ')}</span></p>
                </div>
              )}
            </div>
          )}

          {/* 컨트롤 버튼들 */}
          {showActions && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                disabled={loading.checking}
                className="flex items-center space-x-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>듣기</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleHint}
                disabled={loading.checking}
                className="flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{showHint ? '힌트 숨기기' : '힌트'}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={loading.checking}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 시작</span>
              </Button>
              
              {!showResult ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!canSubmitAnswer || loading.checking}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                >
                  {loading.checking ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{loading.checking ? '확인 중...' : '답안 확인'}</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handlePracticeAgain}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>다시 연습</span>
                  </Button>
                  
                  {hasNextSentence && (
                    <Button
                      onClick={handleNextSentence}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <span>다음 문장</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 진행률 표시 */}
          {userAnswer.length > 0 && !showResult && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {userAnswer.length} / {(currentSentence.content?.split(' ') || []).length} 단어 배치됨
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(userAnswer.length / (currentSentence.content?.split(' ') || []).length) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* 네비게이션 */}
          {showActions && (hasPreviousSentence || hasNextSentence) && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handlePreviousSentence}
                disabled={!hasPreviousSentence}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNextSentence}
                disabled={!hasNextSentence}
                className="flex items-center space-x-2"
              >
                <span>다음</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 결과 분석 섹션 */}
        {showResult && (
          <div className="space-y-6">
            {/* 문법 가이드 */}
            {grammarPoints.length > 0 && (
              <GrammarTips
                grammarPoints={grammarPoints}
                level={propLevel}
                sentence={currentSentence.content}
                userAnswer={userAnswer.map(w => w.text).join(' ')}
                isCorrect={isCorrect}
              />
            )}

            {/* 유사 문장 */}
            {similarSentences.length > 0 && (
              <SimilarSentences
                sentences={similarSentences}
                originalSentence={currentSentence.content}
                level={propLevel}
                onPractice={(sentence) => {
                  // 새로운 문장으로 연습 시작 로직
                  console.log('새로운 문장으로 연습:', sentence);
                }}
              />
            )}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default SentenceBuilder;