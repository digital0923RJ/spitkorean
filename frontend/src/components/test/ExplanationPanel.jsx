// src/components/test/ExplanationPanel.jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Target,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card.jsx';
import TranslatableText from '../common/TranslatableText.jsx';

const ExplanationPanel = ({ 
  question,
  userAnswer = null,
  correctAnswer = null,
  explanation = '',
  isCorrect = null,
  level = 3,
  grammarPoints = [],
  relatedConcepts = [],
  examples = [],
  onRetry,
  showUserAnswer = true,
  expanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [activeTab, setActiveTab] = useState('explanation');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  // TOPIK 레벨별 설정
  const levelConfig = {
    1: { color: 'emerald', name: 'TOPIK I - 1급' },
    2: { color: 'emerald', name: 'TOPIK I - 2급' },
    3: { color: 'blue', name: 'TOPIK II - 3급' },
    4: { color: 'blue', name: 'TOPIK II - 4급' },
    5: { color: 'purple', name: 'TOPIK II - 5급' },
    6: { color: 'purple', name: 'TOPIK II - 6급' }
  };

  const config = levelConfig[level] || levelConfig[3];

  // 탭 목록
  const tabs = [
    { id: 'explanation', label: '해설', icon: BookOpen },
    { id: 'grammar', label: '문법', icon: Target, disabled: grammarPoints.length === 0 },
    { id: 'examples', label: '예시', icon: Lightbulb, disabled: examples.length === 0 },
    { id: 'related', label: '관련 개념', icon: AlertCircle, disabled: relatedConcepts.length === 0 }
  ];

  // TTS 재생
  const playAudio = async (text, id) => {
    if (playingAudio === id) return;
    
    setPlayingAudio(id);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      
      utterance.onend = () => setPlayingAudio(null);
      utterance.onerror = () => setPlayingAudio(null);
      
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  // 텍스트 복사
  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // 옵션 라벨 얻기
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  if (!question) {
    return null;
  }

  return (
    <Card className="shadow-lg border border-gray-200">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <BookOpen className={`w-5 h-5 text-${config.color}-600`} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                <TranslatableText context="ui">문제 해설</TranslatableText>
              </h3>
              <p className="text-sm text-gray-600">
                <TranslatableText context="ui">
                  {config.name} • {question.type || '종합'}
                </TranslatableText>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 정답 여부 표시 */}
            {isCorrect !== null && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                isCorrect 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span className="font-medium">
                  <TranslatableText context="feedback">
                    {isCorrect ? '정답' : '오답'}
                  </TranslatableText>
                </span>
              </div>
            )}
            
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
      </div>

      {/* 확장된 내용 */}
      {isExpanded && (
        <div className="p-4">
          {/* 답안 비교 */}
          {showUserAnswer && userAnswer !== null && correctAnswer !== null && (
            <div className="mb-6 space-y-3">
              <h4 className="font-medium text-gray-900">
                <TranslatableText context="ui">답안 비교</TranslatableText>
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* 사용자 답안 */}
                <Card className={`p-3 border ${
                  isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`} padding="none">
                  <div className="flex items-center space-x-2 mb-2">
                    {isCorrect ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      <TranslatableText context="ui">선택한 답</TranslatableText>
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <TranslatableText>
                      {getOptionLabel(userAnswer)}. {question.options?.[userAnswer]}
                    </TranslatableText>
                  </p>
                </Card>
                
                {/* 정답 */}
                <Card className="p-3 border border-green-200 bg-green-50" padding="none">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      <TranslatableText context="ui">정답</TranslatableText>
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    <TranslatableText>
                      {getOptionLabel(correctAnswer)}. {question.options?.[correctAnswer]}
                    </TranslatableText>
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? `border-${config.color}-500 text-${config.color}-600`
                        : tab.disabled
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>
                        <TranslatableText context="ui">{tab.label}</TranslatableText>
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="space-y-4">
            {/* 해설 탭 */}
            {activeTab === 'explanation' && (
              <div className="space-y-4">
                {explanation ? (
                  <Card className="bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-2">
                          <TranslatableText context="ui">상세 해설</TranslatableText>
                        </h5>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          <TranslatableText context="feedback">
                            {explanation}
                          </TranslatableText>
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(explanation, 'explanation')}
                          disabled={playingAudio === 'explanation'}
                          className="p-2"
                        >
                          <Volume2 className={`w-4 h-4 ${
                            playingAudio === 'explanation' 
                              ? 'text-blue-600 animate-pulse' 
                              : 'text-gray-400'
                          }`} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyText(explanation, 'explanation')}
                          className="p-2"
                        >
                          <Copy className={`w-4 h-4 ${
                            copiedText === 'explanation' 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          }`} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      <TranslatableText context="ui">해설이 준비되지 않았습니다</TranslatableText>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 문법 탭 */}
            {activeTab === 'grammar' && grammarPoints.length > 0 && (
              <div className="space-y-4">
                {grammarPoints.map((point, index) => (
                  <Card key={index} className="border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">
                      <TranslatableText>{point.element}</TranslatableText>
                    </h5>
                    <p className="text-gray-700 text-sm mb-3">
                      <TranslatableText context="feedback">{point.explanation}</TranslatableText>
                    </p>
                    
                    {point.example && (
                      <Card className="bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-blue-600 font-medium">
                              <TranslatableText context="ui">예시</TranslatableText>
                            </span>
                            <p className="text-blue-800 mt-1">
                              <TranslatableText>{point.example}</TranslatableText>
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(point.example, `grammar-${index}`)}
                            className="p-1"
                          >
                            <Volume2 className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* 예시 탭 */}
            {activeTab === 'examples' && examples.length > 0 && (
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <Card key={index} className="bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-yellow-800">
                          <TranslatableText>{example}</TranslatableText>
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(example, `example-${index}`)}
                        className="p-2"
                      >
                        <Volume2 className="w-4 h-4 text-yellow-600" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* 관련 개념 탭 */}
            {activeTab === 'related' && relatedConcepts.length > 0 && (
              <div className="space-y-3">
                {relatedConcepts.map((concept, index) => (
                  <Card key={index} className="border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="font-medium text-gray-900">
                          <TranslatableText>{concept.title}</TranslatableText>
                        </h6>
                        <p className="text-sm text-gray-600 mt-1">
                          <TranslatableText context="feedback">{concept.description}</TranslatableText>
                        </p>
                      </div>
                      
                      {concept.link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          {onRetry && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  💡 <TranslatableText context="ui">이해했다면 비슷한 문제를 더 풀어보세요</TranslatableText>
                </p>
                
                <Button
                  onClick={() => onRetry?.()}
                  className={`bg-${config.color}-600 hover:bg-${config.color}-700 flex items-center space-x-2`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    <TranslatableText context="ui">유사 문제</TranslatableText>
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ExplanationPanel;