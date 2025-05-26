// frontend/src/services/googleTranslate.js
import apiClient from '../api/index.js';
import { SUPPORTED_LANGUAGES, TRANSLATION_SERVICE_MAPPING } from '../shared/constants/languages.js';

/**
 * Google Translate 서비스 (단순화 버전)
 * 백엔드 translation_service.py와 연동
 * 실시간 번역 시스템을 위한 최적화
 */
class GoogleTranslateService {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 500; // 캐시 크기 감소
    this.requestQueue = new Map(); // 중복 요청 방지
  }

  /**
   * 단일 텍스트 번역
   */
  async translateText(text, targetLanguage, sourceLanguage = 'ko') {
    // 입력 검증
    if (!text || !text.trim()) return '';
    if (sourceLanguage === targetLanguage) return text;
    if (!SUPPORTED_LANGUAGES[targetLanguage]) {
      throw new Error(`지원하지 않는 언어입니다: ${targetLanguage}`);
    }

    // 캐시 확인
    const cacheKey = `${sourceLanguage}-${targetLanguage}-${text.trim()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 중복 요청 방지
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    // 번역 요청
    const translatePromise = this._performTranslation(text, targetLanguage, sourceLanguage);
    this.requestQueue.set(cacheKey, translatePromise);

    try {
      const result = await translatePromise;
      this._manageCache(cacheKey, result);
      return result;
    } catch (error) {
      throw error;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * 여러 텍스트 일괄 번역
   */
  async translateMultiple(texts, targetLanguage, sourceLanguage = 'ko') {
    if (!texts || texts.length === 0) return [];
    if (sourceLanguage === targetLanguage) return texts;

    // 캐시된 항목과 번역 필요한 항목 분리
    const results = new Array(texts.length);
    const needTranslation = [];
    const indexMap = new Map();

    texts.forEach((text, index) => {
      if (!text || !text.trim()) {
        results[index] = text;
        return;
      }

      const cacheKey = `${sourceLanguage}-${targetLanguage}-${text.trim()}`;
      if (this.cache.has(cacheKey)) {
        results[index] = this.cache.get(cacheKey);
      } else {
        needTranslation.push(text.trim());
        indexMap.set(text.trim(), index);
      }
    });

    // 번역이 필요한 텍스트가 있는 경우
    if (needTranslation.length > 0) {
      try {
        const response = await apiClient.post('/common/translate-batch', {
          texts: needTranslation,
          source: TRANSLATION_SERVICE_MAPPING.google[sourceLanguage] || sourceLanguage,
          target: TRANSLATION_SERVICE_MAPPING.google[targetLanguage] || targetLanguage,
          type: 'basic'
        });

        const translatedTexts = response.data.data.translatedTexts;

        needTranslation.forEach((originalText, i) => {
          const translatedText = translatedTexts[i] || originalText;
          const originalIndex = indexMap.get(originalText);
          results[originalIndex] = translatedText;

          // 캐시에 저장
          const cacheKey = `${sourceLanguage}-${targetLanguage}-${originalText}`;
          this._manageCache(cacheKey, translatedText);
        });
      } catch (error) {
        console.error('일괄 번역 오류:', error);
        
        // 실패한 항목은 원문으로 채우기
        needTranslation.forEach((originalText) => {
          const originalIndex = indexMap.get(originalText);
          if (results[originalIndex] === undefined) {
            results[originalIndex] = originalText;
          }
        });
      }
    }

    return results;
  }

  /**
   * UI 요소 번역
   */
  async translateUI(uiTexts, targetLanguage) {
    if (!uiTexts || typeof uiTexts !== 'object') {
      return uiTexts;
    }

    try {
      const response = await apiClient.post('/common/translate-ui', {
        uiTexts,
        target: TRANSLATION_SERVICE_MAPPING.google[targetLanguage] || targetLanguage
      });

      return response.data.data.translatedUI;
    } catch (error) {
      console.error('UI 번역 오류:', error);
      return uiTexts; // 실패 시 원본 반환
    }
  }

  /**
   * 언어 감지
   */
  async detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return 'ko'; // 기본값
    }

    // 짧은 텍스트는 한국어로 가정
    if (text.trim().length < 3) {
      return 'ko';
    }

    try {
      const response = await apiClient.post('/common/detect-language', {
        text: text.trim()
      });

      const detected = response.data.data.detectedLanguage;
      
      // 지원하지 않는 언어인 경우 한국어로 처리
      return SUPPORTED_LANGUAGES[detected] ? detected : 'ko';
    } catch (error) {
      console.error('언어 감지 오류:', error);
      return 'ko'; // 기본값 반환
    }
  }

  /**
   * 실제 번역 수행 (private)
   */
  async _performTranslation(text, targetLanguage, sourceLanguage) {
    const response = await apiClient.post('/common/translate', {
      text: text.trim(),
      source: TRANSLATION_SERVICE_MAPPING.google[sourceLanguage] || sourceLanguage,
      target: TRANSLATION_SERVICE_MAPPING.google[targetLanguage] || targetLanguage,
      type: 'basic'
    });

    return response.data.data.translatedText;
  }

  /**
   * 캐시 관리 (private)
   */
  _manageCache(key, value) {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxCacheSize) {
      // 가장 오래된 항목 삭제 (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  /**
   * 지원 언어 목록 조회
   */
  getSupportedLanguages() {
    return { ...SUPPORTED_LANGUAGES };
  }

  /**
   * 캐시 관리 메서드들
   */
  clearCache() {
    this.cache.clear();
    this.requestQueue.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }

  getQueueSize() {
    return this.requestQueue.size;
  }

  /**
   * 캐시 상태 조회
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      queueSize: this.requestQueue.size,
      cacheUsage: Math.round((this.cache.size / this.maxCacheSize) * 100)
    };
  }

  /**
   * 특정 언어 쌍의 캐시된 번역 개수
   */
  getCachedTranslationCount(sourceLanguage, targetLanguage) {
    const prefix = `${sourceLanguage}-${targetLanguage}-`;
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * 캐시 예열 (자주 사용되는 텍스트 미리 번역)
   */
  async preloadCommonTranslations(commonTexts, targetLanguages) {
    const promises = [];
    
    for (const targetLanguage of targetLanguages) {
      for (const text of commonTexts) {
        promises.push(
          this.translateText(text, targetLanguage, 'ko').catch(error => {
            console.warn(`예열 번역 실패 (${text} -> ${targetLanguage}):`, error);
          })
        );
      }
    }
    
    await Promise.allSettled(promises);
  }
}

// 싱글톤 인스턴스 생성
const googleTranslateService = new GoogleTranslateService();

export default googleTranslateService;