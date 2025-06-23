// src/components/drama/GrammarTips.jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Target,
  Check,
  X,
  Volume2,
  ArrowRight
} from 'lucide-react';
import Button from '../common/Buttom.jsx';
import Card, { CardHeader, CardBody, CardFooter } from '../common/Card.jsx';
import TranslatableText, { T, TFeedback, TUI } from '../common/TranslatableText.jsx';

const GrammarTips = ({ 
  grammarPoints = [],
  level = 'beginner',
  sentence = '',
  userAnswer = '',
  isCorrect = null,
  compact = false
}) => {
  const [expandedPoint, setExpandedPoint] = useState(null);
  const [playingExample, setPlayingExample] = useState(null);

  // 레벨별 설정
  const levelConfig = {
    beginner: {
      maxPoints: 2,
      showAdvanced: false,
      focusAreas: ['basic_particles', 'word_order', 'politeness'],
      levelText: '기초'
    },
    intermediate: {
      maxPoints: 3,
      showAdvanced: true,
      focusAreas: ['connective_endings', 'tense', 'causative', 'passive'],
      levelText: '중급'
    },
    advanced: {
      maxPoints: 5,
      showAdvanced: true,
      focusAreas: ['complex_grammar', 'honorifics', 'idiomatic_expressions'],
      levelText: '고급'
    }
  };

  const config = levelConfig[level] || levelConfig.beginner;

  // 예시 발음
  const playExample = async (text, pointId) => {
    if (!text || playingExample === pointId) return;
    
    setPlayingExample(pointId);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      
      utterance.onend = () => setPlayingExample(null);
      utterance.onerror = () => setPlayingExample(null);
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingExample(null), 2000);
    }
  };

  // 문법 포인트 확장/축소
  const toggleExpanded = (pointId) => {
    setExpandedPoint(expandedPoint === pointId ? null : pointId);
  };

  // 기본 문법 포인트 (grammarPoints가 비어있을 때)
  const defaultGrammarPoints = {
    beginner: [
      {
        id: 'basic_particles',
        element: '기본 조사',
        explanation: '은/는(주제), 이/가(주어), 을/를(목적어)의 기본 사용법',
        example: '나는 학생이에요. 책을 읽어요.',
        tip: '주제와 주어의 차이를 이해하는 것이 중요해요!'
      }
    ],
    intermediate: [
      {
        id: 'connective_endings',
        element: '연결어미',
        explanation: '두 문장을 자연스럽게 연결하는 어미들',
        example: '비가 와서 집에 있어요.',
        tip: '상황에 맞는 연결어미를 선택하는 것이 핵심이에요.'
      }
    ],
    advanced: [
      {
        id: 'complex_grammar',
        element: '복합 문법',
        explanation: '관형절과 부사절을 활용한 복잡한 문장 구성',
        example: '어제 본 영화가 정말 재미있었어요.',
        tip: '문장의 구조를 파악하면 이해가 쉬워져요.'
      }
    ]
  };

  // 표시할 문법 포인트 결정
  const pointsToShow = grammarPoints.length > 0 
    ? grammarPoints.slice(0, config.maxPoints)
    : defaultGrammarPoints[level] || [];

  // 컴팩트 모드
  if (compact) {
    return (
      <Card variant="info" padding="default" className="border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-medium text-blue-900">
            <T>핵심 문법</T> ({pointsToShow.length}<T>개</T>)
          </h4>
        </div>
        
        <div className="space-y-2">
          {pointsToShow.slice(0, 2).map((point, index) => (
            <div key={point.id || index} className="text-sm">
              <span className="font-medium text-blue-800">
                <T>{point.element}</T>:
              </span>
              <span className="text-blue-700 ml-1">
                <T>{point.explanation}</T>
              </span>
            </div>
          ))}
          
          {pointsToShow.length > 2 && (
            <div className="text-xs text-blue-600">
              +{pointsToShow.length - 2}<T>개 더</T>...
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (pointsToShow.length === 0) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
          <T>문법 포인트 분석 중</T>...
        </p>
      </Card>
    );
  }

  return (
    <Card shadow="lg" className="border-gray-200">
      {/* 헤더 */}
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                <T>문법 가이드</T>
              </h3>
              <p className="text-sm text-gray-600">
                <T>{config.levelText}</T> <T>레벨</T> • {pointsToShow.length}<T>개 포인트</T>
              </p>
            </div>
          </div>
          
          {/* 정답 여부 표시 */}
          {isCorrect !== null && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isCorrect ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                <T>{isCorrect ? '정답' : '다시 도전'}</T>
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* 문법 포인트 목록 */}
      <CardBody className="space-y-4">
        {pointsToShow.map((point, index) => (
          <Card 
            key={point.id || index}
            variant="default"
            padding="none"
            className="border border-gray-200 overflow-hidden"
          >
            {/* 문법 포인트 헤더 */}
            <button
              onClick={() => toggleExpanded(point.id || index)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      <T>{point.element}</T>
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      <T>{point.explanation}</T>
                    </p>
                  </div>
                </div>
                
                {expandedPoint === (point.id || index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* 확장된 내용 */}
            {expandedPoint === (point.id || index) && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="space-y-4 pt-4">
                  {/* 상세 설명 */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      <T>상세 설명</T>
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <T>{point.explanation}</T>
                    </p>
                  </div>

                  {/* 예시 */}
                  {point.example && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        <T>예시</T>
                      </h5>
                      <Card variant="default" padding="sm" className="border border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900 font-medium">
                            {point.example}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playExample(point.example, point.id || index)}
                            disabled={playingExample === (point.id || index)}
                            className="p-1"
                          >
                            <Volume2 className={`w-4 h-4 ${
                              playingExample === (point.id || index) 
                                ? 'text-blue-600 animate-pulse' 
                                : 'text-gray-400'
                            }`} />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* 학습 팁 */}
                  {point.tip && (
                    <Card variant="warning" padding="sm" className="border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-yellow-800 mb-1">
                            <T>학습 팁</T>
                          </h5>
                          <p className="text-sm text-yellow-700">
                            <T>{point.tip}</T>
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* 관련 문법 (고급 레벨) */}
                  {config.showAdvanced && point.related && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        <T>관련 문법</T>
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {point.related.map((related, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            <T>{related}</T>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </CardBody>

      {/* 문장 비교 (오답인 경우) */}
      {!isCorrect && userAnswer && sentence && (
        <div className="p-4 border-t border-gray-100">
          <Card variant="error" padding="default">
            <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span><T>문장 비교</T></span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <X className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">
                  <T>작성한 답</T>:
                </span>
                <span className="text-sm text-gray-900">{userAnswer}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  <T>정답</T>:
                </span>
                <span className="text-sm text-gray-900 font-medium">{sentence}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 푸터 */}
      <CardFooter className="bg-gray-50">
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-gray-500">
            💡 <T>문법을 이해하면 한국어가 더 쉬워져요</T>!
          </p>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span><TUI>더 많은 예시</TUI></span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GrammarTips;