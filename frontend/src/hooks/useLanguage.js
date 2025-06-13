// frontend/src/hooks/useLanguage.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  translateText,
  translateMultiple,
  translateUI,
  detectLanguage,
  setCurrentLanguage,
  addTranslationToCache,
  clearTranslationHistory,
  cleanupCache,
  updateSettings,
  clearErrors,
  clearError,
  selectCurrentLanguage,
  selectSupportedLanguages,
  selectTranslations,
  selectTranslationHistory,
  selectUITranslations,
  selectDetectedLanguages,
  selectLanguageLoading,
  selectLanguageErrors,
  selectLanguageSettings,
  selectCurrentLanguageInfo
} from '../store/slices/languageSlice.jsx';
import googleTranslateService from '../services/googleTranslate.js';
import openaiService from '../services/openai.js';

// 🆕 Storage 유틸리티 import
//removed
import { getStoredLanguage, setStoredLanguage } from '../utils/storage.js';

/**
 * 언어 관련 커스텀 훅 (useTranslation에서 단순화)
 * 
 * 기능:
 * 1. 언어 설정 관리
 * 2. 기본 텍스트 번역 (Google Translate)
 * 3. 학습 피드백 번역 (OpenAI) 
 * 4. UI 번역 관리
 * 5. 언어 감지
 * 6. 번역 캐시 관리
 */
export const useLanguage = () => {
  const dispatch = useDispatch();
  
  // 상태 선택
  const currentLanguage = useSelector(selectCurrentLanguage);
  const supportedLanguages = useSelector(selectSupportedLanguages);
  const translations = useSelector(selectTranslations);
  const translationHistory = useSelector(selectTranslationHistory);
  const uiTranslations = useSelector(selectUITranslations);
  const detectedLanguages = useSelector(selectDetectedLanguages);
  const loading = useSelector(selectLanguageLoading);
  const errors = useSelector(selectLanguageErrors);
  const settings = useSelector(selectLanguageSettings);
  const currentLanguageInfo = useSelector(selectCurrentLanguageInfo);

  /**
   * 🆕 Google Translate Service를 사용한 직접 번역
   */
  const translateDirect = useCallback(async (text, targetLanguage = null, sourceLanguage = 'ko') => {
    const target = targetLanguage || currentLanguage;
    
    // 같은 언어면 원문 반환
    if (sourceLanguage === target) {
      return text;
    }
    
    try {
      const translatedText = await googleTranslateService.translateText(text, target, sourceLanguage);
      
      // 캐시에 저장
      const cacheKey = `${text}-${sourceLanguage}-${target}`;
      dispatch(addTranslationToCache({
        key: cacheKey,
        translatedText,
        sourceLanguage,
        targetLanguage: target,
        originalText: text
      }));
      
      return translatedText;
    } catch (error) {
      console.error('직접 번역 오류:', error);
      return text; // 실패시 원문 반환
    }
  }, [dispatch, currentLanguage]);

  /**
   * 🆕 Google Translate Service를 사용한 일괄 번역
   */
  const translateBatchDirect = useCallback(async (texts, targetLanguage = null, sourceLanguage = 'ko') => {
    const target = targetLanguage || currentLanguage;
    
    if (!texts || texts.length === 0) return [];
    if (sourceLanguage === target) return texts;

    try {
      const translatedTexts = await googleTranslateService.translateMultiple(texts, target, sourceLanguage);
      
      // 각 번역을 캐시에 저장
      texts.forEach((text, index) => {
        const cacheKey = `${text}-${sourceLanguage}-${target}`;
        dispatch(addTranslationToCache({
          key: cacheKey,
          translatedText: translatedTexts[index],
          sourceLanguage,
          targetLanguage: target,
          originalText: text
        }));
      });
      
      return translatedTexts;
    } catch (error) {
      console.error('일괄 직접 번역 오류:', error);
      return texts; // 실패시 원문 반환
    }
  }, [dispatch, currentLanguage]);

  /**
   * 기본 텍스트 번역 (Redux + Google Translate 혼합 사용)
   */
  const translate = useCallback(async (text, targetLanguage = null, sourceLanguage = 'ko', useCache = true) => {
    const target = targetLanguage || currentLanguage;
    
    // 같은 언어면 원문 반환
    if (sourceLanguage === target) {
      return text;
    }
    
    // 캐시 우선 확인 (useCache가 true일 때)
    if (useCache) {
      const cacheKey = `${text}-${sourceLanguage}-${target}`;
      const cachedTranslation = translations[cacheKey];
      if (cachedTranslation && !_isCacheExpired(cachedTranslation.timestamp)) {
        return cachedTranslation.translatedText;
      }
    }

    try {
      // 🆕 설정에 따라 다른 번역 서비스 사용
      if (settings.preferDirectTranslation) {
        return await translateDirect(text, target, sourceLanguage);
      } else {
        // Redux 액션 사용 (백엔드 API 호출)
        const result = await dispatch(translateText({
          text,
          targetLanguage: target,
          sourceLanguage
        })).unwrap();
        
        return result.translatedText;
      }
    } catch (error) {
      console.error('번역 오류:', error);
      
      // 🆕 백업으로 직접 번역 시도
      try {
        return await translateDirect(text, target, sourceLanguage);
      } catch (fallbackError) {
        console.error('백업 번역도 실패:', fallbackError);
        return text; // 최종 실패시 원문 반환
      }
    }
  }, [dispatch, currentLanguage, translations, settings, translateDirect]);

  /**
   * 여러 텍스트 일괄 번역
   */
  const translateBatch = useCallback(async (texts, targetLanguage = null, sourceLanguage = 'ko', useCache = true) => {
    const target = targetLanguage || currentLanguage;
    
    if (!texts || texts.length === 0) return [];
    if (sourceLanguage === target) return texts;

    try {
      // 🆕 설정에 따라 다른 번역 서비스 사용
      if (settings.preferDirectTranslation) {
        return await translateBatchDirect(texts, target, sourceLanguage);
      } else {
        // Redux 액션 사용
        const result = await dispatch(translateMultiple({
          texts,
          targetLanguage: target,
          sourceLanguage
        })).unwrap();
        
        return result.translatedTexts;
      }
    } catch (error) {
      console.error('일괄 번역 오류:', error);
      
      // 🆕 백업으로 직접 번역 시도
      try {
        return await translateBatchDirect(texts, target, sourceLanguage);
      } catch (fallbackError) {
        console.error('백업 일괄 번역도 실패:', fallbackError);
        return texts; // 최종 실패시 원문 반환
      }
    }
  }, [dispatch, currentLanguage, settings, translateBatchDirect]);

  /**
   * 학습 피드백 번역 (OpenAI 사용)
   */
  const translateFeedback = useCallback(async (feedbackData, context = 'general') => {
    if (currentLanguage === 'ko') {
      return feedbackData; // 한국어면 번역 불필요
    }

    try {
      let translatedFeedback = {};

      switch (context) {
        case 'conversation': // Talk Like You Mean It
          translatedFeedback = await openaiService.generateChatFeedback(
            feedbackData.userMessage,
            feedbackData.aiResponse,
            feedbackData.userLevel,
            currentLanguage,
            feedbackData.emotionData
          );
          break;

        case 'grammar': // Drama Builder
          translatedFeedback = await openaiService.analyzeGrammar(
            feedbackData.userSentence,
            feedbackData.correctSentence,
            feedbackData.level,
            currentLanguage
          );
          break;

        case 'test': // Test & Study
          translatedFeedback = await openaiService.generateTestExplanation(
            feedbackData.question,
            feedbackData.userAnswer,
            feedbackData.correctAnswer,
            currentLanguage
          );
          break;

        case 'pronunciation': // Korean Journey
          translatedFeedback = await openaiService.analyzePronunciation(
            feedbackData.originalText,
            feedbackData.transcribedText,
            feedbackData.pronunciationScore,
            feedbackData.level,
            currentLanguage
          );
          break;

        default:
          // 일반 피드백 번역
          if (typeof feedbackData === 'string') {
            translatedFeedback = await translate(feedbackData);
          } else {
            // 객체인 경우 각 값을 번역
            const keys = Object.keys(feedbackData);
            const values = Object.values(feedbackData);
            const translatedValues = await translateBatch(values);
            
            translatedFeedback = {};
            keys.forEach((key, index) => {
              translatedFeedback[key] = translatedValues[index];
            });
          }
      }

      return translatedFeedback;
    } catch (error) {
      console.error('학습 피드백 번역 오류:', error);
      return feedbackData;
    }
  }, [currentLanguage, translate, translateBatch]);

  /**
   * UI 텍스트 번역
   */
  const translateUIText = useCallback(async (uiTexts, targetLanguage = null) => {
    const target = targetLanguage || currentLanguage;
    
    // 캐시 확인
    const cachedUI = uiTranslations[target];
    if (cachedUI && !_isCacheExpired(cachedUI.timestamp)) {
      return cachedUI.translatedUI;
    }

    try {
      // 🆕 Google Translate Service 직접 사용 옵션
      if (settings.preferDirectTranslation) {
        const translatedUI = await googleTranslateService.translateUI(uiTexts, target);
        
        // Redux 상태에 캐시 저장
        dispatch(addTranslationToCache({
          key: `ui_${target}`,
          translatedText: translatedUI,
          sourceLanguage: 'ko',
          targetLanguage: target,
          originalText: uiTexts
        }));
        
        return translatedUI;
      } else {
        // Redux 액션 사용
        const result = await dispatch(translateUI({
          uiTexts,
          targetLanguage: target
        })).unwrap();
        
        return result.translatedUI;
      }
    } catch (error) {
      console.error('UI 번역 오류:', error);
      return uiTexts;
    }
  }, [dispatch, currentLanguage, uiTranslations, settings]);

  /**
   * 언어 자동 감지
   */
  const detectTextLanguage = useCallback(async (text) => {
    // 캐시 확인
    const cachedDetection = detectedLanguages[text];
    if (cachedDetection && !_isCacheExpired(cachedDetection.timestamp)) {
      return cachedDetection.detectedLanguage;
    }

    try {
      // 🆕 Google Translate Service 직접 사용 옵션
      if (settings.preferDirectTranslation) {
        const detectedLang = await googleTranslateService.detectLanguage(text);
        
        // Redux 상태에 캐시 저장
        dispatch(addTranslationToCache({
          key: `detect_${text}`,
          translatedText: detectedLang,
          sourceLanguage: 'unknown',
          targetLanguage: 'detect',
          originalText: text
        }));
        
        return detectedLang;
      } else {
        // Redux 액션 사용
        const result = await dispatch(detectLanguage({ text })).unwrap();
        return result.detectedLanguage;
      }
    } catch (error) {
      console.error('언어 감지 오류:', error);
      return 'ko'; // 기본값 반환
    }
  }, [dispatch, detectedLanguages, settings]);

  /**
   * 🆕 언어 변경 (스토리지와 연동)
   */
  const changeLanguage = useCallback((newLanguage) => {
    if (supportedLanguages[newLanguage]) {
      // Redux 상태 업데이트
      dispatch(setCurrentLanguage(newLanguage));
      
      // 🆕 로컬 스토리지에 저장
      setStoredLanguage(newLanguage);
      
      return true;
    }
    return false;
  }, [dispatch, supportedLanguages]);

  /**
   * 🆕 저장된 언어 설정 불러오기
   */
  const loadStoredLanguage = useCallback(() => {
    const storedLanguage = getStoredLanguage();
    if (storedLanguage && supportedLanguages[storedLanguage]) {
      dispatch(setCurrentLanguage(storedLanguage));
      return storedLanguage;
    }
    return currentLanguage;
  }, [dispatch, supportedLanguages, currentLanguage]);

  /**
   * 캐시 만료 확인 (private)
   */
  const _isCacheExpired = useCallback((timestamp) => {
    return Date.now() - timestamp > settings.cacheExpiry;
  }, [settings.cacheExpiry]);

  /**
   * 지원 언어 목록 (UI 표시용)
   */
  const languageOptions = useMemo(() => {
    return Object.entries(supportedLanguages).map(([code, info]) => ({
      value: code,
      label: info.name,
      flag: info.flag,
      direction: info.direction
    }));
  }, [supportedLanguages]);

  /**
   * 로딩 상태 확인
   */
  const isTranslating = useMemo(() => {
    return Object.values(loading).some(isLoading => isLoading);
  }, [loading]);

  /**
   * 에러 상태 확인
   */
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== null);
  }, [errors]);

  // 🆕 컴포넌트 마운트 시 저장된 언어 설정 로드
  useEffect(() => {
    loadStoredLanguage();
  }, [loadStoredLanguage]);

  // 컴포넌트 마운트 시 캐시 정리
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(cleanupCache());
    }, 60 * 60 * 1000); // 1시간마다 캐시 정리

    return () => clearInterval(interval);
  }, [dispatch]);

  // 언어 변경 시 HTML 속성 업데이트
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = currentLanguageInfo?.direction || 'ltr';
    }
  }, [currentLanguage, currentLanguageInfo]);

  // 🆕 Google Translate Service 캐시 상태 동기화
  useEffect(() => {
    if (googleTranslateService && googleTranslateService.getCacheStats) {
      const stats = googleTranslateService.getCacheStats();
      console.log('Google Translate Service 캐시 상태:', stats);
    }
  }, [translations]);

  return {
    // 상태
    currentLanguage,
    currentLanguageInfo,
    supportedLanguages,
    languageOptions,
    isTranslating,
    hasErrors,
    
    // 🆕 번역 함수들 (개선됨)
    translate,
    translateBatch,
    translateDirect, // 직접 번역
    translateBatchDirect, // 직접 일괄 번역
    translateFeedback,
    translateUIText,
    detectTextLanguage,
    
    // 🆕 언어 관리 (스토리지 연동)
    changeLanguage,
    loadStoredLanguage,
    
    // 캐시 관리
    clearCache: () => {
      dispatch(cleanupCache());
      googleTranslateService.clearCache(); // 🆕 Google Service 캐시도 정리
    },
    clearHistory: () => dispatch(clearTranslationHistory()),
    
    // 설정 및 에러 관리
    updateSettings: (newSettings) => dispatch(updateSettings(newSettings)),
    clearErrors: () => dispatch(clearErrors()),
    
    // 🆕 유틸리티 (확장됨)
    isSupported: (langCode) => !!supportedLanguages[langCode],
    getCacheSize: () => Object.keys(translations).length,
    getHistorySize: () => translationHistory.length,
    getGoogleCacheStats: () => googleTranslateService.getCacheStats?.() || {},
    
    // 🆕 번역 서비스 직접 접근
    googleTranslateService,
    
    // 🆕 일반적인 번역 작업용 헬퍼 함수들
    translateIfNeeded: async (text, target = null) => {
      return target && target !== 'ko' ? await translate(text, target) : text;
    },
    
    translateArrayIfNeeded: async (texts, target = null) => {
      return target && target !== 'ko' ? await translateBatch(texts, target) : texts;
    },
    
    isKorean: () => currentLanguage === 'ko',
    needsTranslation: (target = null) => (target || currentLanguage) !== 'ko'
  };
};

export default useLanguage;