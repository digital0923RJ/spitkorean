// frontend/src/store/slices/languageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import googleTranslateService from '@/services/googleTranslate'
import storage from '@/utils/storage'
import { 
  SUPPORTED_LANGUAGES,
  LANGUAGE_CODES,
  LANGUAGES_BY_PRIORITY,
  RTL_LANGUAGES,
  TRANSLATION_SERVICE_MAPPING,
  detectBrowserLanguage,
  getTextDirection,
  isValidLanguage,
  getLanguageInfo,
  getLanguageOptions,
  DEFAULT_LANGUAGE
} from '@/shared/constants/languages'
import toast from 'react-hot-toast'

/**
 * 언어 상태 관리 슬라이스
 * 다국어 번역, UI 언어 설정, 지원 언어 관리
 */

// 스토리지에서 저장된 언어 정보 가져오기
const getStoredLanguage = () => {
  const storedUILang = storage.user.getUILanguage();
  const storedNativeLang = storage.user.getNativeLanguage();

  return {
    ui: isValidLanguage(storedUILang) ? storedUILang : 'en',
    native: isValidLanguage(storedNativeLang) ? storedNativeLang : 'en'
  };
};

// 언어 정보를 스토리지에 저장
const setStoredLanguage = (type, language) => {
  if (type === 'ui') {
    return storage.user.setUILanguage(language)
  } else if (type === 'native') {
    return storage.user.setNativeLanguage(language)
  }
  return false
}

// 번역 캐시 키 생성
const createCacheKey = (text, sourceLanguage, targetLanguage) => {
  return `${text}-${sourceLanguage}-${targetLanguage}`
}

// 비동기 액션: 텍스트 번역
export const translateText = createAsyncThunk(
  'language/translateText',
  async ({ text, targetLanguage, sourceLanguage = 'ko' }, { rejectWithValue, getState }) => {
    try {
      // 캐시 확인
      const cacheKey = createCacheKey(text, sourceLanguage, targetLanguage)
      const cachedTranslation = storage.cache.getTranslationCache(text, targetLanguage)
      
      if (cachedTranslation) {
        toast.success('캐시된 번역을 불러왔습니다.', { 
          duration: 1500,
          icon: '⚡' 
        })
        
        return {
          originalText: text,
          translatedText: cachedTranslation,
          sourceLanguage,
          targetLanguage,
          timestamp: Date.now(),
          fromCache: true
        }
      }
      
      toast.loading('번역 중...', { 
        id: 'translate-text',
        duration: Infinity 
      })
      
      const translatedText = await googleTranslateService.translateText(
        text, 
        targetLanguage, 
        sourceLanguage
      )
      
      // 캐시에 저장
      storage.cache.setTranslationCache(text, targetLanguage, translatedText)
      
      const sourceInfo = getLanguageInfo(sourceLanguage)
      const targetInfo = getLanguageInfo(targetLanguage)
      
      toast.success(`${sourceInfo?.flag || ''} → ${targetInfo?.flag || ''} 번역 완료!`, { 
        id: 'translate-text',
        duration: 2000 
      })
      
      return {
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now(),
        fromCache: false
      }
    } catch (error) {
      toast.error('번역에 실패했습니다. 다시 시도해주세요.', { 
        id: 'translate-text' 
      })
      
      return rejectWithValue({
        message: error.message || '번역에 실패했습니다.',
        originalText: text
      })
    }
  }
)

// 비동기 액션: 여러 텍스트 일괄 번역
export const translateMultiple = createAsyncThunk(
  'language/translateMultiple',
  async ({ texts, targetLanguage, sourceLanguage = 'ko' }, { rejectWithValue }) => {
    try {
      toast.loading(`${texts.length}개 텍스트를 번역하는 중...`, { 
        id: 'translate-multiple',
        duration: Infinity 
      })
      
      const translatedTexts = await googleTranslateService.translateMultiple(
        texts,
        targetLanguage,
        sourceLanguage
      )
      
      // 각 번역을 개별적으로 캐시에 저장
      texts.forEach((text, index) => {
        const translatedText = translatedTexts[index]
        if (translatedText) {
          storage.cache.setTranslationCache(text, targetLanguage, translatedText)
        }
      })
      
      const targetInfo = getLanguageInfo(targetLanguage)
      toast.success(`${targetInfo?.flag || ''} ${texts.length}개 텍스트 번역 완료!`, { 
        id: 'translate-multiple',
        duration: 3000 
      })

      return {
        originalTexts: texts,
        translatedTexts,
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now()
      }
    } catch (error) {
      toast.error('일괄 번역에 실패했습니다.', { 
        id: 'translate-multiple' 
      })
      
      return rejectWithValue({
        message: error.message || '일괄 번역에 실패했습니다.',
        originalTexts: texts
      })
    }
  }
)

// 비동기 액션: UI 번역
export const translateUI = createAsyncThunk(
  'language/translateUI',
  async ({ uiTexts, targetLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('UI를 번역하는 중...', { 
        id: 'translate-ui',
        duration: Infinity 
      })
      
      const translatedUI = await googleTranslateService.translateUI(
        uiTexts,
        targetLanguage
      )
      
      const targetInfo = getLanguageInfo(targetLanguage)
      toast.success(`${targetInfo?.flag || ''} UI 번역 완료!`, { 
        id: 'translate-ui',
        duration: 2000 
      })

      return {
        originalUI: uiTexts,
        translatedUI,
        targetLanguage,
        timestamp: Date.now()
      }
    } catch (error) {
      toast.error('UI 번역에 실패했습니다.', { 
        id: 'translate-ui' 
      })
      
      return rejectWithValue({
        message: error.message || 'UI 번역에 실패했습니다.',
        originalUI: uiTexts
      })
    }
  }
)

// 비동기 액션: 언어 감지
export const detectLanguage = createAsyncThunk(
  'language/detectLanguage',
  async ({ text }, { rejectWithValue }) => {
    try {
      const detectedLanguage = await googleTranslateService.detectLanguage(text)
      
      const detectedInfo = getLanguageInfo(detectedLanguage)
      if (detectedInfo) {
        toast.success(`${detectedInfo.flag} ${detectedInfo.name}로 감지되었습니다.`, {
          duration: 2000
        })
      } else {
        toast.success('언어가 감지되었습니다.', {
          duration: 2000
        })
      }
      
      return {
        text,
        detectedLanguage,
        confidence: 0.9, // Google Translate API는 신뢰도를 제공하지 않으므로 기본값
        timestamp: Date.now()
      }
    } catch (error) {
      toast.error('언어 감지에 실패했습니다.')
      
      return rejectWithValue({
        message: error.message || '언어 감지에 실패했습니다.',
        text
      })
    }
  }
)

// 비동기 액션: 언어팩 다운로드 (오프라인 사용)
export const downloadLanguagePack = createAsyncThunk(
  'language/downloadLanguagePack',
  async ({ languageCode }, { rejectWithValue }) => {
    try {
      const languageInfo = getLanguageInfo(languageCode)
      
      if (!languageInfo) {
        throw new Error('지원하지 않는 언어입니다.')
      }
      
      toast.loading(`${languageInfo.flag} ${languageInfo.name} 언어팩 다운로드 중...`, { 
        id: 'download-lang-pack',
        duration: Infinity 
      })
      
      // 실제로는 언어팩 다운로드 API 호출
      // const languagePack = await languageService.downloadPack(languageCode)
      
      // 시뮬레이션을 위한 가짜 데이터
      const languagePack = {
        language: languageCode,
        version: '1.0.0',
        translations: {},
        downloadedAt: Date.now()
      }
      
      // 오프라인 저장
      storage.offline.setOfflineData(`language_pack_${languageCode}`, languagePack)
      
      toast.success(`${languageInfo.flag} ${languageInfo.name} 언어팩 다운로드 완료!`, { 
        id: 'download-lang-pack',
        duration: 3000 
      })
      
      return languagePack
    } catch (error) {
      toast.error('언어팩 다운로드에 실패했습니다.', { 
        id: 'download-lang-pack' 
      })
      
      return rejectWithValue(error.message || '언어팩 다운로드에 실패했습니다.')
    }
  }
)

// 비동기 액션: 번역 기록 동기화
export const syncTranslationHistory = createAsyncThunk(
  'language/syncTranslationHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { language } = getState()
      
      if (language.translationHistory.length === 0) {
        toast('동기화할 번역 기록이 없습니다.', {
          icon: 'ℹ️'
        })
        return { synced: 0 }
      }
      
      toast.loading('번역 기록을 동기화하는 중...', { 
        id: 'sync-translations',
        duration: Infinity 
      })
      
      // 실제로는 서버와 동기화
      // await translationService.syncHistory(language.translationHistory)
      
      const syncedCount = language.translationHistory.length
      
      toast.success(`${syncedCount}개의 번역 기록이 동기화되었습니다.`, { 
        id: 'sync-translations',
        duration: 2000 
      })
      
      return { synced: syncedCount }
    } catch (error) {
      toast.error('번역 기록 동기화에 실패했습니다.', { 
        id: 'sync-translations' 
      })
      
      return rejectWithValue(error.message || '동기화에 실패했습니다.')
    }
  }
)

// 초기 상태
const storedLanguages = getStoredLanguage()

const initialState = {
  // UI 언어 설정
  currentLanguage: storedLanguages.ui,
  nativeLanguage: storedLanguages.native,
  
  // 번역 관련
  translations: {}, // { 'text-source-target': { original, translated, timestamp } }
  translationHistory: [], // 최근 번역 기록
  
  // UI 번역 캐시
  uiTranslations: {}, // { 'language': { translatedUI } }
  
  // 언어 감지 결과
  detectedLanguages: {}, // { 'text': { language, confidence, timestamp } }
  
  // 언어팩 (오프라인 사용)
  languagePacks: {}, // { 'languageCode': { version, translations, downloadedAt } }
  
  // 지원 언어 목록
  supportedLanguages: SUPPORTED_LANGUAGES,
  
  // 로딩 상태
  loading: {
    translate: false,
    translateMultiple: false,
    translateUI: false,
    detectLanguage: false,
    downloadLanguagePack: false,
    syncTranslationHistory: false
  },
  
  // 에러 상태
  error: {
    translate: null,
    translateMultiple: null,
    translateUI: null,
    detectLanguage: null,
    downloadLanguagePack: null,
    syncTranslationHistory: null
  },

  // 설정
  settings: {
    autoDetect: true, // 자동 언어 감지
    saveHistory: true, // 번역 기록 저장
    maxHistoryItems: 100, // 최대 기록 개수
    cacheExpiry: 24 * 60 * 60 * 1000, // 24시간 (밀리초)
    offlineMode: false, // 오프라인 모드
    autoTranslate: false, // 자동 번역
    showTranslationSource: true // 번역 출처 표시
  },

  // 통계
  stats: {
    totalTranslations: 0,
    todayTranslations: 0,
    favoriteLanguages: [],
    translationAccuracy: 0
  }
}

// 슬라이스 생성
const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    // UI 언어 변경
    setCurrentLanguage: (state, action) => {
      const newLanguage = action.payload
      
      if (isValidLanguage(newLanguage)) {
        const oldLanguage = state.currentLanguage
        state.currentLanguage = newLanguage
        
        // 스토리지에 저장
        setStoredLanguage('ui', newLanguage)
        
        // HTML 속성 업데이트
        if (typeof document !== 'undefined') {
          document.documentElement.lang = newLanguage
          document.documentElement.dir = getTextDirection(newLanguage)
        }
        
        const oldInfo = getLanguageInfo(oldLanguage)
        const newInfo = getLanguageInfo(newLanguage)
        
        if (oldLanguage !== newLanguage) {
          toast.success(`${oldInfo?.flag || ''} → ${newInfo?.flag || ''} 언어가 변경되었습니다.`, {
            duration: 2000
          })
        }
      } else {
        toast.error('지원하지 않는 언어입니다.')
      }
    },

    // 모국어 변경
    setNativeLanguage: (state, action) => {
      const newLanguage = action.payload
      
      if (isValidLanguage(newLanguage)) {
        const oldLanguage = state.nativeLanguage
        state.nativeLanguage = newLanguage
        
        // 스토리지에 저장
        setStoredLanguage('native', newLanguage)
        
        const oldInfo = getLanguageInfo(oldLanguage)
        const newInfo = getLanguageInfo(newLanguage)
        
        if (oldLanguage !== newLanguage) {
          toast.success(`모국어가 ${oldInfo?.flag || ''} → ${newInfo?.flag || ''} ${newInfo?.name}로 변경되었습니다.`)
        }
      } else {
        toast.error('지원하지 않는 언어입니다.')
      }
    },

    // 번역 캐시에 직접 추가
    addTranslationToCache: (state, action) => {
      const { originalText, translatedText, sourceLanguage, targetLanguage } = action.payload
      const cacheKey = createCacheKey(originalText, sourceLanguage, targetLanguage)
      
      state.translations[cacheKey] = {
        originalText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now()
      }

      // 스토리지 캐시에도 저장
      storage.cache.setTranslationCache(originalText, targetLanguage, translatedText)
    },

    // 번역 기록에서 항목 제거
    removeFromHistory: (state, action) => {
      const indexToRemove = action.payload
      
      if (indexToRemove >= 0 && indexToRemove < state.translationHistory.length) {
        const removedItem = state.translationHistory[indexToRemove]
        state.translationHistory.splice(indexToRemove, 1)
        
        toast('번역 기록이 삭제되었습니다.', {
          icon: '🗑️',
          duration: 1500
        })
      }
    },

    // 번역 기록 전체 삭제
    clearTranslationHistory: (state) => {
      const count = state.translationHistory.length
      state.translationHistory = []
      
      if (count > 0) {
        toast.success(`${count}개의 번역 기록이 모두 삭제되었습니다.`)
      } else {
        toast('삭제할 번역 기록이 없습니다.', {
          icon: 'ℹ️'
        })
      }
    },

    // 번역 캐시 정리 (만료된 항목 제거)
    cleanupCache: (state) => {
      const now = Date.now()
      const expiry = state.settings.cacheExpiry
      let cleanedCount = 0
      
      // 번역 캐시 정리
      Object.keys(state.translations).forEach(key => {
        if (now - state.translations[key].timestamp > expiry) {
          delete state.translations[key]
          cleanedCount++
        }
      })
      
      // UI 번역 캐시 정리
      Object.keys(state.uiTranslations).forEach(key => {
        if (now - state.uiTranslations[key].timestamp > expiry) {
          delete state.uiTranslations[key]
          cleanedCount++
        }
      })
      
      // 언어 감지 캐시 정리
      Object.keys(state.detectedLanguages).forEach(key => {
        if (now - state.detectedLanguages[key].timestamp > expiry) {
          delete state.detectedLanguages[key]
          cleanedCount++
        }
      })

      // 스토리지 캐시도 정리
      storage.cache.cleanupExpiredCache()
      
      if (cleanedCount > 0) {
        toast.success(`${cleanedCount}개의 만료된 캐시가 정리되었습니다.`)
      }
    },

    // 설정 업데이트
    updateSettings: (state, action) => {
      const oldSettings = { ...state.settings }
      state.settings = {
        ...state.settings,
        ...action.payload
      }

      // 설정 변경 알림
      if (action.payload.autoDetect !== undefined && action.payload.autoDetect !== oldSettings.autoDetect) {
        toast(action.payload.autoDetect ? '자동 언어 감지가 활성화되었습니다.' : '자동 언어 감지가 비활성화되었습니다.', {
          icon: action.payload.autoDetect ? '🔍' : '🚫'
        })
      }

      if (action.payload.offlineMode !== undefined && action.payload.offlineMode !== oldSettings.offlineMode) {
        toast(action.payload.offlineMode ? '오프라인 모드가 활성화되었습니다.' : '온라인 모드로 전환되었습니다.', {
          icon: action.payload.offlineMode ? '📶' : '🌐'
        })
      }
    },

    // 언어팩 제거
    removeLanguagePack: (state, action) => {
      const languageCode = action.payload
      
      if (state.languagePacks[languageCode]) {
        delete state.languagePacks[languageCode]
        
        // 오프라인 스토리지에서도 제거
        storage.offline.setOfflineData(`language_pack_${languageCode}`, null)
        
        const languageInfo = getLanguageInfo(languageCode)
        toast.success(`${languageInfo?.flag || ''} ${languageInfo?.name || languageCode} 언어팩이 제거되었습니다.`)
      }
    },

    // 즐겨찾는 언어 추가/제거
    toggleFavoriteLanguage: (state, action) => {
      const languageCode = action.payload
      const { favoriteLanguages } = state.stats
      
      const index = favoriteLanguages.indexOf(languageCode)
      if (index > -1) {
        favoriteLanguages.splice(index, 1)
        
        const languageInfo = getLanguageInfo(languageCode)
        toast(`${languageInfo?.flag || ''} ${languageInfo?.name}이(가) 즐겨찾기에서 제거되었습니다.`)
      } else {
        favoriteLanguages.push(languageCode)
        
        const languageInfo = getLanguageInfo(languageCode)
        toast(`${languageInfo?.flag || ''} ${languageInfo?.name}이(가) 즐겨찾기에 추가되었습니다.`)
      }
    },

    // 통계 업데이트
    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload
      }
    },

    // 에러 클리어
    clearErrors: (state) => {
      state.error = {
        translate: null,
        translateMultiple: null,
        translateUI: null,
        detectLanguage: null,
        downloadLanguagePack: null,
        syncTranslationHistory: null
      }
    },

    // 특정 에러 클리어
    clearError: (state, action) => {
      const errorType = action.payload
      if (state.error[errorType]) {
        state.error[errorType] = null
      }
    },

    // 언어 초기화 (첫 방문자용)
    initializeLanguages: (state) => {
      const browserLanguage = detectBrowserLanguage()
      
      if (browserLanguage !== state.currentLanguage) {
        const browserInfo = getLanguageInfo(browserLanguage)
        
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span>브라우저 언어를 감지했습니다.</span>
            <span>{browserInfo?.flag} {browserInfo?.name}로 변경하시겠습니까?</span>
            <div className="flex gap-2">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  languageSlice.caseReducers.setCurrentLanguage(state, { payload: browserLanguage })
                  toast.dismiss(t.id)
                }}
              >
                변경
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded text-sm"
                onClick={() => toast.dismiss(t.id)}
              >
                유지
              </button>
            </div>
          </div>
        ), { duration: 8000 })
      }
    }
  },
  
  extraReducers: (builder) => {
    // translateText
    builder
      .addCase(translateText.pending, (state) => {
        state.loading.translate = true
        state.error.translate = null
      })
      .addCase(translateText.fulfilled, (state, action) => {
        state.loading.translate = false
        
        const { originalText, translatedText, sourceLanguage, targetLanguage, timestamp, fromCache } = action.payload
        const cacheKey = createCacheKey(originalText, sourceLanguage, targetLanguage)
        
        // 캐시에 저장
        state.translations[cacheKey] = action.payload
        
        // 기록에 추가 (설정이 활성화된 경우)
        if (state.settings.saveHistory && !fromCache) {
          state.translationHistory.unshift(action.payload)
          
          // 최대 기록 개수 제한
          if (state.translationHistory.length > state.settings.maxHistoryItems) {
            state.translationHistory = state.translationHistory.slice(0, state.settings.maxHistoryItems)
          }
        }

        // 통계 업데이트
        if (!fromCache) {
          state.stats.totalTranslations += 1
          state.stats.todayTranslations += 1
        }
      })
      .addCase(translateText.rejected, (state, action) => {
        state.loading.translate = false
        state.error.translate = action.payload?.message || '번역에 실패했습니다.'
      })

    // translateMultiple
    builder
      .addCase(translateMultiple.pending, (state) => {
        state.loading.translateMultiple = true
        state.error.translateMultiple = null
      })
      .addCase(translateMultiple.fulfilled, (state, action) => {
        state.loading.translateMultiple = false
        
        const { originalTexts, translatedTexts, sourceLanguage, targetLanguage, timestamp } = action.payload
        
        // 각 번역을 개별적으로 캐시에 저장
        originalTexts.forEach((originalText, index) => {
          const translatedText = translatedTexts[index]
          const cacheKey = createCacheKey(originalText, sourceLanguage, targetLanguage)
          
          state.translations[cacheKey] = {
            originalText,
            translatedText,
            sourceLanguage,
            targetLanguage,
            timestamp
          }
        })

        // 통계 업데이트
        state.stats.totalTranslations += originalTexts.length
        state.stats.todayTranslations += originalTexts.length
      })
      .addCase(translateMultiple.rejected, (state, action) => {
        state.loading.translateMultiple = false
        state.error.translateMultiple = action.payload?.message || '일괄 번역에 실패했습니다.'
      })

    // translateUI
    builder
      .addCase(translateUI.pending, (state) => {
        state.loading.translateUI = true
        state.error.translateUI = null
      })
      .addCase(translateUI.fulfilled, (state, action) => {
        state.loading.translateUI = false
        
        const { targetLanguage, translatedUI, timestamp } = action.payload
        
        // UI 번역 캐시에 저장
        state.uiTranslations[targetLanguage] = {
          translatedUI,
          timestamp
        }
      })
      .addCase(translateUI.rejected, (state, action) => {
        state.loading.translateUI = false
        state.error.translateUI = action.payload?.message || 'UI 번역에 실패했습니다.'
      })

    // detectLanguage
    builder
      .addCase(detectLanguage.pending, (state) => {
        state.loading.detectLanguage = true
        state.error.detectLanguage = null
      })
      .addCase(detectLanguage.fulfilled, (state, action) => {
        state.loading.detectLanguage = false
        
        const { text, detectedLanguage, confidence, timestamp } = action.payload
        
        // 언어 감지 결과 캐시에 저장
        state.detectedLanguages[text] = {
          detectedLanguage,
          confidence,
          timestamp
        }
      })
      .addCase(detectLanguage.rejected, (state, action) => {
        state.loading.detectLanguage = false
        state.error.detectLanguage = action.payload?.message || '언어 감지에 실패했습니다.'
      })

    // downloadLanguagePack
    builder
      .addCase(downloadLanguagePack.pending, (state) => {
        state.loading.downloadLanguagePack = true
        state.error.downloadLanguagePack = null
      })
      .addCase(downloadLanguagePack.fulfilled, (state, action) => {
        state.loading.downloadLanguagePack = false
        
        const languagePack = action.payload
        state.languagePacks[languagePack.language] = languagePack
      })
      .addCase(downloadLanguagePack.rejected, (state, action) => {
        state.loading.downloadLanguagePack = false
        state.error.downloadLanguagePack = action.payload
      })

    // syncTranslationHistory
    builder
      .addCase(syncTranslationHistory.pending, (state) => {
        state.loading.syncTranslationHistory = true
        state.error.syncTranslationHistory = null
      })
      .addCase(syncTranslationHistory.fulfilled, (state, action) => {
        state.loading.syncTranslationHistory = false
        // 동기화 완료 후 추가 로직이 있다면 여기에
      })
      .addCase(syncTranslationHistory.rejected, (state, action) => {
        state.loading.syncTranslationHistory = false
        state.error.syncTranslationHistory = action.payload
      })
  }
})

// 액션 익스포트
export const {
  setCurrentLanguage,
  setNativeLanguage,
  addTranslationToCache,
  removeFromHistory,
  clearTranslationHistory,
  cleanupCache,
  updateSettings,
  removeLanguagePack,
  toggleFavoriteLanguage,
  updateStats,
  clearErrors,
  clearError,
  initializeLanguages
} = languageSlice.actions

// 기본 셀렉터
export const selectCurrentLanguage = (state) => state.language.currentLanguage
export const selectNativeLanguage = (state) => state.language.nativeLanguage
export const selectSupportedLanguages = (state) => state.language.supportedLanguages
export const selectTranslations = (state) => state.language.translations
export const selectTranslationHistory = (state) => state.language.translationHistory
export const selectUITranslations = (state) => state.language.uiTranslations
export const selectDetectedLanguages = (state) => state.language.detectedLanguages
export const selectLanguagePacks = (state) => state.language.languagePacks
export const selectLanguageLoading = (state) => state.language.loading
export const selectLanguageErrors = (state) => state.language.error
export const selectLanguageSettings = (state) => state.language.settings
export const selectLanguageStats = (state) => state.language.stats

// 특정 번역 조회 셀렉터
export const selectTranslation = (originalText, sourceLanguage, targetLanguage) => (state) => {
  const cacheKey = createCacheKey(originalText, sourceLanguage, targetLanguage)
  return state.language.translations[cacheKey]
}

// 특정 언어의 UI 번역 조회 셀렉터
export const selectUITranslation = (language) => (state) => {
  return state.language.uiTranslations[language]?.translatedUI
}

// 특정 텍스트의 감지된 언어 조회 셀렉터
export const selectDetectedLanguage = (text) => (state) => {
  return state.language.detectedLanguages[text]
}

// 현재 언어 정보 셀렉터
export const selectCurrentLanguageInfo = (state) => {
  const currentLang = state.language.currentLanguage
  return getLanguageInfo(currentLang)
}

// 모국어 정보 셀렉터
export const selectNativeLanguageInfo = (state) => {
  const nativeLang = state.language.nativeLanguage
  return getLanguageInfo(nativeLang)
}

// 즐겨찾는 언어 목록 셀렉터
export const selectFavoriteLanguages = (state) => {
  return state.language.stats.favoriteLanguages.map(code => ({
    code,
    ...getLanguageInfo(code)
  }))
}

// 다운로드된 언어팩 목록 셀렉터
export const selectDownloadedLanguagePacks = (state) => {
  return Object.keys(state.language.languagePacks).map(code => ({
    code,
    ...getLanguageInfo(code),
    ...state.language.languagePacks[code]
  }))
}

// RTL 언어 여부 확인 셀렉터
export const selectIsCurrentLanguageRTL = (state) => {
  return RTL_LANGUAGES.includes(state.language.currentLanguage)
}

// 언어 옵션 생성 셀렉터
export const selectLanguageOptions = (state) => {
  return getLanguageOptions(true) // 우선순위 포함
}

// 최근 번역 언어 셀렉터
export const selectRecentTranslationLanguages = (state) => {
  const recentLanguages = new Set()
  
  state.language.translationHistory.slice(0, 10).forEach(item => {
    recentLanguages.add(item.targetLanguage)
  })
  
  return Array.from(recentLanguages).map(code => ({
    code,
    ...getLanguageInfo(code)
  }))
}

// 리듀서 익스포트
export default languageSlice.reducer