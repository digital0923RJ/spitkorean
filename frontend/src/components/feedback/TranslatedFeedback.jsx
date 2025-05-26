// src/components/feedback/TranslatedFeedback.jsx
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Globe, 
  Languages, 
  Volume2, 
  Copy, 
  RefreshCw,
  ChevronDown,
  CheckCircle,
  Loader2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../common/Card';
import Button from '../common/Button';
import FeedbackCard from './FeedbackCard';
import TranslatableText, { TUI, TFeedback } from '../common/TranslatableText';
import { 
  translateText, 
  selectCurrentLanguage, 
  selectSupportedLanguages,
  selectTranslation,
  selectLanguageLoading
} from '@/store/slices/languageSlice';

const TranslatedFeedback = ({
  originalFeedback = {},
  originalLanguage = 'ko',
  type = 'general',
  showLanguageSelector = true,
  showToggle = true,
  autoTranslate = true,
  className = '',
  ...props
}) => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector(selectCurrentLanguage);
  const supportedLanguages = useSelector(selectSupportedLanguages);
  const isLoading = useSelector(selectLanguageLoading);
  
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);
  const [translatedContent, setTranslatedContent] = useState({});

  // 번역이 필요한 필드들
  const translatableFields = [
    'summary',
    'explanation', 
    'strengths',
    'weaknesses',
    'improvements',
    'suggestions'
  ];

  // 캐시된 번역 조회
  const getCachedTranslation = useCallback((text, targetLang) => {
    return useSelector(selectTranslation(text, originalLanguage, targetLang));
  }, [originalLanguage]);

  // 텍스트 번역
  const translateSingleText = useCallback(async (text, targetLang) => {
    if (!text || originalLanguage === targetLang) return text;
    
    // 캐시 확인
    const cached = getCachedTranslation(text, targetLang);
    if (cached) return cached.translatedText;
    
    try {
      const result = await dispatch(translateText({
        text,
        targetLanguage: targetLang,
        sourceLanguage: originalLanguage
      })).unwrap();
      
      return result.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // 번역 실패 시 원본 반환
    }
  }, [dispatch, originalLanguage, getCachedTranslation]);

  // 배열 번역
  const translateArray = useCallback(async (items, targetLang) => {
    if (!items || items.length === 0) return items;
    
    const translatedItems = await Promise.all(
      items.map(item => translateSingleText(item, targetLang))
    );
    
    return translatedItems;
  }, [translateSingleText]);

  // 전체 피드백 번역
  const translateFeedback = useCallback(async (targetLang) => {
    if (originalLanguage === targetLang) {
      setTranslatedContent(originalFeedback);
      return;
    }

    const translated = { ...originalFeedback };

    // 각 필드 번역
    for (const field of translatableFields) {
      const value = originalFeedback[field];
      
      if (!value) continue;

      if (typeof value === 'string') {
        translated[field] = await translateSingleText(value, targetLang);
      } else if (Array.isArray(value)) {
        translated[field] = await translateArray(value, targetLang);
      }
    }

    // 문법 포인트 번역 (중첩 구조)
    if (originalFeedback.grammarPoints) {
      translated.grammarPoints = await Promise.all(
        originalFeedback.grammarPoints.map(async (point) => ({
          ...point,
          element: await translateSingleText(point.element, targetLang),
          explanation: await translateSingleText(point.explanation, targetLang),
          example: point.example ? await translateSingleText(point.example, targetLang) : point.example
        }))
      );
    }

    // 예시 문장 번역
    if (originalFeedback.examples) {
      translated.examples = await Promise.all(
        originalFeedback.examples.map(async (example) => {
          if (typeof example === 'string') {
            return await translateSingleText(example, targetLang);
          } else if (example.sentence) {
            return {
              ...example,
              sentence: await translateSingleText(example.sentence, targetLang),
              translation: example.translation ? await translateSingleText(example.translation, targetLang) : example.translation
            };
          }
          return example;
        })
      );
    }

    setTranslatedContent(translated);
  }, [originalFeedback, originalLanguage, translatableFields, translateSingleText, translateArray]);

  // 언어 변경 시 번역 실행
  useEffect(() => {
    if (autoTranslate && selectedLanguage !== originalLanguage) {
      translateFeedback(selectedLanguage);
    } else {
      setTranslatedContent(originalFeedback);
    }
  }, [selectedLanguage, originalFeedback, autoTranslate, translateFeedback, originalLanguage]);

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

  // 수동 번역 트리거
  const handleManualTranslate = useCallback(() => {
    translateFeedback(selectedLanguage);
  }, [translateFeedback, selectedLanguage]);

  // TTS 재생 (번역된 텍스트)
  const handlePlayTranslated = useCallback((text) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'ko' ? 'ko-KR' : 
                      selectedLanguage === 'ja' ? 'ja-JP' :
                      selectedLanguage === 'zh' ? 'zh-CN' :
                      selectedLanguage === 'en' ? 'en-US' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, [selectedLanguage]);

  // 표시할 콘텐츠 결정
  const displayContent = showTranslation ? translatedContent : originalFeedback;
  const isTranslated = selectedLanguage !== originalLanguage && showTranslation;

  return (
    <Card className={`${className}`} shadow="md" {...props}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Languages className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              <TUI>다국어 피드백</TUI>
            </h3>
            <p className="text-sm text-gray-600">
              <TUI>{isTranslated ? '번역된 내용' : '원본 내용'}</TUI>
            </p>
          </div>
        </div>

        {/* 언어 선택 및 토글 */}
        <div className="flex items-center space-x-2">
          {/* 번역 토글 */}
          {showToggle && selectedLanguage !== originalLanguage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-gray-600 hover:text-gray-800"
              title={showTranslation ? "원본 보기" : "번역 보기"}
            >
              {showTranslation ? (
                <ToggleRight className="w-5 h-5 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </Button>
          )}

          {/* 언어 선택 드롭다운 */}
          {showLanguageSelector && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <Globe className="w-4 h-4" />
                <span>{supportedLanguages[selectedLanguage]?.flag}</span>
                <span className="text-sm">{supportedLanguages[selectedLanguage]?.name}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {Object.entries(supportedLanguages).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setSelectedLanguage(code);
                          setShowDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                          selectedLanguage === code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm">{lang.name}</span>
                        {selectedLanguage === code && (
                          <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 수동 번역 버튼 */}
          {!autoTranslate && selectedLanguage !== originalLanguage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualTranslate}
              disabled={isLoading.translate}
              className="text-indigo-600 hover:text-indigo-700"
              title="번역 새로고침"
            >
              {isLoading.translate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading.translate && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">
              <TUI>번역 중...</TUI>
            </span>
          </div>
        </div>
      )}

      {/* FeedbackCard를 활용한 번역된 콘텐츠 표시 */}
      {!isLoading.translate && (
        <div className="space-y-4">
          {/* 메인 피드백 카드 */}
          {(displayContent.summary || displayContent.explanation) && (
            <FeedbackCard
              type={type}
              title={isTranslated ? "번역된 피드백" : "원본 피드백"}
              subtitle={`언어: ${supportedLanguages[selectedLanguage]?.name || selectedLanguage}`}
              feedback={{
                summary: displayContent.summary || displayContent.explanation,
                strengths: displayContent.strengths,
                weaknesses: displayContent.weaknesses,
                improvements: displayContent.improvements || displayContent.suggestions,
                timestamp: new Date().toISOString()
              }}
              showDetails={true}
              onPlayAudio={handlePlayTranslated}
              className={`${isTranslated ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}
            />
          )}

          {/* 문법 포인트를 개별 FeedbackCard로 표시 */}
          {displayContent.grammarPoints && displayContent.grammarPoints.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">
                <TUI>문법 포인트</TUI>
              </h5>
              {displayContent.grammarPoints.map((point, index) => (
                <FeedbackCard
                  key={index}
                  type="grammar"
                  title={point.element}
                  feedback={{
                    summary: point.explanation,
                    timestamp: new Date().toISOString()
                  }}
                  showDetails={true}
                  onPlayAudio={point.example ? () => handlePlayTranslated(point.example) : null}
                  className={`${isTranslated ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                />
              ))}
            </div>
          )}

          {/* 예시 문장들 */}
          {displayContent.examples && displayContent.examples.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">
                <TUI>예시 문장</TUI>
              </h5>
              {displayContent.examples.slice(0, 3).map((example, index) => (
                <div key={index} className={`p-4 rounded-lg border ${isTranslated ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${isTranslated ? 'text-green-800' : 'text-gray-800'}`}>
                        {example.sentence || example}
                      </p>
                      {example.translation && (
                        <p className={`text-sm mt-1 ${isTranslated ? 'text-green-600' : 'text-gray-600'}`}>
                          <TFeedback>{example.translation}</TFeedback>
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayTranslated(example.sentence || example)}
                        className="p-1"
                        title="예시 문장 듣기"
                      >
                        <Volume2 className={`w-4 h-4 ${isTranslated ? 'text-green-600' : 'text-gray-600'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(example.sentence || example, `example-${index}`)}
                        className="p-1"
                        title="예시 문장 복사"
                      >
                        <Copy className={`w-4 h-4 ${
                          copiedItem === `example-${index}` ? 'text-green-600' : 
                          isTranslated ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 추가 개선사항이나 제안이 있을 경우 별도 FeedbackCard */}
          {(displayContent.improvements && displayContent.improvements.length > 0) || 
           (displayContent.suggestions && displayContent.suggestions.length > 0) && (
            <FeedbackCard
              type="general"
              title="개선 제안"
              feedback={{
                improvements: displayContent.improvements || displayContent.suggestions,
                timestamp: new Date().toISOString()
              }}
              showDetails={true}
              onPlayAudio={handlePlayTranslated}
              className={`${isTranslated ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}
            />
          )}
        </div>
      )}

      {/* 하단 정보 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Globe className="w-3 h-3" />
            <span>
              <TranslatableText context="ui">
                {isTranslated 
                  ? `${supportedLanguages[originalLanguage]?.name} → ${supportedLanguages[selectedLanguage]?.name}`
                  : `원본 (${supportedLanguages[originalLanguage]?.name})`
                }
              </TranslatableText>
            </span>
          </div>
          
          {isTranslated && (
            <span>
              <TUI>Google Translate 제공</TUI>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

// PropTypes 정의
TranslatedFeedback.propTypes = {
  originalFeedback: PropTypes.shape({
    summary: PropTypes.string,
    explanation: PropTypes.string,
    strengths: PropTypes.arrayOf(PropTypes.string),
    weaknesses: PropTypes.arrayOf(PropTypes.string),
    improvements: PropTypes.arrayOf(PropTypes.string),
    suggestions: PropTypes.arrayOf(PropTypes.string),
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
    ]))
  }),
  originalLanguage: PropTypes.string,
  type: PropTypes.oneOf(['pronunciation', 'grammar', 'conversation', 'test', 'general']),
  showLanguageSelector: PropTypes.bool,
  showToggle: PropTypes.bool,
  autoTranslate: PropTypes.bool,
  className: PropTypes.string
};

export default TranslatedFeedback;