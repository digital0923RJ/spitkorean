// src/components/feedback/AiFeedback.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  BookOpen,
  Volume2,
  Copy,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../common/Card';
import Button from '../common/Button';
import FeedbackCard from './FeedbackCard';
import TranslatableText, { TUI, TFeedback } from '../common/TranslatableText';
import { selectCurrentLanguage } from '@/store/slices/languageSlice';

const AiFeedback = ({
  feedback = {},
  originalText = '',
  userAnswer = '',
  type = 'general', // 'pronunciation', 'grammar', 'conversation', 'test'
  level = 'beginner',
  showGrammarPoints = true,
  showExamples = true,
  showSimilarSentences = false,
  onRegenerateAnalysis = null,
  onPlayAudio = null,
  className = '',
  ...props
}) => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector(selectCurrentLanguage);
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [copiedItem, setCopiedItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    analysis: true,
    grammar: false,
    examples: false,
    similar: false
  });

  // AI 분석 데이터 구조
  const {
    analysis = {},
    grammarPoints = [],
    examples = [],
    similarSentences = [],
    confidence = 0,
    processingTime = 0,
    suggestions = [],
    score = null,
    isCorrect = null,
    xpEarned = 0
  } = feedback;

  // 탭 목록
  const tabs = [
    { 
      id: 'analysis', 
      label: 'AI 분석', 
      icon: Brain,
      available: true
    },
    { 
      id: 'grammar', 
      label: '문법 포인트', 
      icon: Target,
      available: showGrammarPoints && grammarPoints.length > 0
    },
    { 
      id: 'examples', 
      label: '예시 문장', 
      icon: Lightbulb,
      available: showExamples && examples.length > 0
    },
    { 
      id: 'similar', 
      label: '유사 문장', 
      icon: BookOpen,
      available: showSimilarSentences && similarSentences.length > 0
    }
  ];

  // 텍스트 복사
  const handleCopy = useCallback(async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, []);

  // 섹션 토글
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // 신뢰도에 따른 색상
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`${className}`} shadow="lg" {...props}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span>
                <TUI>AI 상세 분석</TUI>
              </span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </h3>
            <p className="text-sm text-gray-600">
              <TUI>GPT-4 기반 학습 피드백</TUI>
            </p>
          </div>
        </div>

        {/* 신뢰도 및 재생성 */}
        <div className="flex items-center space-x-3">
          {confidence > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">
                <TUI>분석 신뢰도</TUI>
              </div>
              <div className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                {confidence}%
              </div>
            </div>
          )}
          
          {onRegenerateAnalysis && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRegenerateAnalysis()}
              className="text-purple-600 hover:text-purple-700"
              title="분석 다시 생성"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 메인 피드백 카드 - FeedbackCard 활용 */}
      {(analysis.overall || score !== null || isCorrect !== null) && (
        <div className="mb-6">
          <FeedbackCard
            type={type}
            score={score}
            isCorrect={isCorrect}
            title="AI 분석 결과"
            subtitle={`신뢰도: ${confidence}%`}
            feedback={{
              summary: analysis.overall,
              strengths: analysis.strengths,
              weaknesses: analysis.weaknesses,
              improvements: suggestions,
              timestamp: new Date().toISOString(),
              xpEarned: xpEarned
            }}
            level={level}
            showDetails={true}
            onPlayAudio={onPlayAudio}
            onRetry={onRegenerateAnalysis}
            className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"
          />
        </div>
      )}

      {/* 원본 텍스트 표시 */}
      {(originalText || userAnswer) && (
        <div className="mb-6 space-y-3">
          {originalText && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600">
                  <TUI>원본 텍스트</TUI>
                </span>
                <div className="flex items-center space-x-1">
                  {onPlayAudio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayAudio(originalText)}
                      className="p-1"
                      title="원본 텍스트 듣기"
                    >
                      <Volume2 className="w-3 h-3 text-blue-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(originalText, 'original')}
                    className="p-1"
                    title="텍스트 복사"
                  >
                    <Copy className={`w-3 h-3 ${
                      copiedItem === 'original' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-blue-800 mt-1">{originalText}</p>
            </div>
          )}

          {userAnswer && userAnswer !== originalText && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  <TUI>사용자 답변</TUI>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(userAnswer, 'user')}
                  className="p-1"
                  title="답변 복사"
                >
                  <Copy className={`w-3 h-3 ${
                    copiedItem === 'user' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </Button>
              </div>
              <p className="text-sm text-gray-800 mt-1">{userAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-1">
          {tabs.filter(tab => tab.available).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>
                    <TUI>{tab.label}</TUI>
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="space-y-4">
        {/* AI 분석 탭 */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* 추가 상세 분석이 있는 경우 별도 FeedbackCard로 표시 */}
            {analysis.detailed && (
              <FeedbackCard
                type="general"
                title="상세 분석"
                feedback={{
                  summary: analysis.detailed,
                  timestamp: new Date().toISOString()
                }}
                level={level}
                showDetails={true}
                onPlayAudio={onPlayAudio}
                className="bg-purple-50 border-purple-200"
              />
            )}

            {/* 강점과 약점 - FeedbackCard 형태로 표시 */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <FeedbackCard
                type="general"
                title="강점 분석"
                feedback={{
                  strengths: analysis.strengths,
                  timestamp: new Date().toISOString()
                }}
                level={level}
                showDetails={true}
                onPlayAudio={onPlayAudio}
                className="bg-green-50 border-green-200"
              />
            )}

            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <FeedbackCard
                type="general"
                title="개선점 분석"
                feedback={{
                  weaknesses: analysis.weaknesses,
                  improvements: suggestions,
                  timestamp: new Date().toISOString()
                }}
                level={level}
                showDetails={true}
                onPlayAudio={onPlayAudio}
                className="bg-red-50 border-red-200"
              />
            )}
          </div>
        )}

        {/* 문법 포인트 탭 */}
        {activeTab === 'grammar' && grammarPoints.length > 0 && (
          <div className="space-y-4">
            {grammarPoints.map((point, index) => (
              <FeedbackCard
                key={index}
                type="grammar"
                title={point.element}
                feedback={{
                  summary: point.explanation,
                  timestamp: new Date().toISOString()
                }}
                level={level}
                showDetails={true}
                onPlayAudio={onPlayAudio ? () => onPlayAudio(point.example) : null}
                className="bg-blue-50 border-blue-200"
              />
            ))}
          </div>
        )}

        {/* 예시 문장 탭 */}
        {activeTab === 'examples' && examples.length > 0 && (
          <div className="space-y-3">
            {examples.map((example, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">{example.sentence || example}</p>
                    {example.translation && (
                      <p className="text-sm text-green-600 mt-1">
                        <TFeedback>{example.translation}</TFeedback>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-3">
                    {onPlayAudio && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlayAudio(example.sentence || example)}
                        className="p-1"
                        title="예시 문장 듣기"
                      >
                        <Volume2 className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(example.sentence || example, `example-${index}`)}
                      className="p-1"
                      title="예시 문장 복사"
                    >
                      <Copy className={`w-4 h-4 ${
                        copiedItem === `example-${index}` ? 'text-green-600' : 'text-green-600'
                      }`} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 유사 문장 탭 */}
        {activeTab === 'similar' && similarSentences.length > 0 && (
          <div className="space-y-3">
            {similarSentences.map((sentence, index) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-purple-800 font-medium">{sentence}</p>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-3">
                    {onPlayAudio && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlayAudio(sentence)}
                        className="p-1"
                        title="유사 문장 듣기"
                      >
                        <Volume2 className="w-4 h-4 text-purple-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(sentence, `similar-${index}`)}
                      className="p-1"
                      title="유사 문장 복사"
                    >
                      <Copy className={`w-4 h-4 ${
                        copiedItem === `similar-${index}` ? 'text-green-600' : 'text-purple-600'
                      }`} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 메타 정보 */}
      {processingTime > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              <TUI>AI 분석 시간: {processingTime}ms</TUI>
            </span>
            <span>
              <TUI>GPT-4 기반</TUI>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

// PropTypes 정의
AiFeedback.propTypes = {
  feedback: PropTypes.shape({
    analysis: PropTypes.shape({
      overall: PropTypes.string,
      detailed: PropTypes.string,
      strengths: PropTypes.arrayOf(PropTypes.string),
      weaknesses: PropTypes.arrayOf(PropTypes.string)
    }),
    grammarPoints: PropTypes.arrayOf(PropTypes.shape({
      element: PropTypes.string,
      explanation: PropTypes.string,
      example: PropTypes.string
    })),
    examples: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        sentence: PropTypes.string,
        translation: PropTypes.string
      })
    ])),
    similarSentences: PropTypes.arrayOf(PropTypes.string),
    confidence: PropTypes.number,
    processingTime: PropTypes.number,
    suggestions: PropTypes.arrayOf(PropTypes.string),
    score: PropTypes.number,
    isCorrect: PropTypes.bool,
    xpEarned: PropTypes.number
  }),
  originalText: PropTypes.string,
  userAnswer: PropTypes.string,
  type: PropTypes.oneOf(['pronunciation', 'grammar', 'conversation', 'test', 'general']),
  level: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  showGrammarPoints: PropTypes.bool,
  showExamples: PropTypes.bool,
  showSimilarSentences: PropTypes.bool,
  onRegenerateAnalysis: PropTypes.func,
  onPlayAudio: PropTypes.func,
  className: PropTypes.string
};

export default AiFeedback;