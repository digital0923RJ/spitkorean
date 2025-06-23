// src/utils/storage.js
/**
 * SpitKorean 로컬 스토리지 관리 유틸리티
 *
 * 기능:
 * 1. 인증 토큰 관리 (JWT)
 * 2. 사용자 설정 저장/복원
 * 3. 언어 설정 관리
 * 4. 학습 진행상황 임시 저장
 * 5. 캐시 데이터 관리
 * 6. 보안 스토리지 (민감한 데이터)
 */

// 스토리지 키 상수 정의
const STORAGE_KEYS = {
  // 인증 관련
  AUTH_TOKEN: "spitkorean_auth_token",
  REFRESH_TOKEN: "spitkorean_refresh_token",
  USER_DATA: "spitkorean_user_data",
  SESSION_EXPIRY: "spitkorean_session_expiry",

  // 사용자 설정
  USER_PREFERENCES: "spitkorean_user_preferences",
  APP_SETTINGS: "spitkorean_app_settings",
  UI_LANGUAGE: "spitkorean_ui_language",
  NATIVE_LANGUAGE: "spitkorean_native_language",

  // 학습 관련
  LEARNING_PROGRESS: "spitkorean_learning_progress",
  STUDY_GOALS: "spitkorean_study_goals",
  DAILY_PROGRESS: "spitkorean_daily_progress",
  OFFLINE_DATA: "spitkorean_offline_data",

  // 캐시 관련
  TRANSLATION_CACHE: "spitkorean_translation_cache",
  CONTENT_CACHE: "spitkorean_content_cache",
  API_CACHE: "spitkorean_api_cache",

  // 상품별 설정
  TALK_SETTINGS: "spitkorean_talk_settings",
  DRAMA_SETTINGS: "spitkorean_drama_settings",
  TEST_SETTINGS: "spitkorean_test_settings",
  JOURNEY_SETTINGS: "spitkorean_journey_settings",

  // 기타
  ONBOARDING_STATUS: "spitkorean_onboarding_status",
  FEATURE_FLAGS: "spitkorean_feature_flags",
  ERROR_LOGS: "spitkorean_error_logs",
  ANALYTICS_DATA: "spitkorean_analytics_data",
}

// 기본 설정값
const DEFAULT_SETTINGS = {
  app: {
    theme: "system",
    language: "en",
    sound: true,
    autoplay: true,
    quality: "high",
    notifications: true,
  },
  notifications: {
    email: true,
    push: true,
    marketing: false,
    studyReminder: true,
    achievement: true,
  },
  privacy: {
    profileVisibility: "public",
    activityTracking: true,
    dataSharing: false,
  },
  learning: {
    dailyGoal: 15, // 분
    reminderTime: "19:00",
    autoSave: true,
    showHints: true,
  },
}

/**
 * 기본 스토리지 클래스
 */
class BaseStorage {
  constructor(storageType = "localStorage") {
    this.storage = storageType === "sessionStorage" ? sessionStorage : localStorage
    this.prefix = "spitkorean_"
  }

  /**
   * 안전한 JSON 파싱
   */
  _safeJsonParse(value, fallback = null) {
    try {
      return JSON.parse(value)
    } catch (error) {
      console.warn("JSON 파싱 실패:", error)
      return fallback
    }
  }

  /**
   * 안전한 JSON 문자열화
   */
  _safeJsonStringify(value) {
    try {
      return JSON.stringify(value)
    } catch (error) {
      console.warn("JSON 문자열화 실패:", error)
      return null
    }
  }

  /**
   * 키 설정 (접두사 포함)
   */
  _getKey(key) {
    return `${this.prefix}${key}`
  }

  /**
   * 값 설정
   */
  set(key, value) {
    try {
      const serializedValue = typeof value === "string" ? value : this._safeJsonStringify(value)
      if (serializedValue !== null) {
        this.storage.setItem(this._getKey(key), serializedValue)
        return true
      }
      return false
    } catch (error) {
      console.error("스토리지 저장 실패:", error)
      return false
    }
  }

  /**
   * 값 가져오기
   */
  get(key, fallback = null) {
    try {
      const value = this.storage.getItem(this._getKey(key))
      if (value === null) return fallback

      // JSON인지 확인하고 파싱 시도
      if (value.startsWith("{") || value.startsWith("[") || value.startsWith('"')) {
        return this._safeJsonParse(value, fallback)
      }

      return value
    } catch (error) {
      console.error("스토리지 읽기 실패:", error)
      return fallback
    }
  }

  /**
   * 값 삭제
   */
  remove(key) {
    try {
      this.storage.removeItem(this._getKey(key))
      return true
    } catch (error) {
      console.error("스토리지 삭제 실패:", error)
      return false
    }
  }

  /**
   * 모든 관련 데이터 삭제
   */
  clear() {
    try {
      const keys = Object.keys(this.storage)
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error("스토리지 전체 삭제 실패:", error)
      return false
    }
  }

  /**
   * 키 존재 여부 확인
   */
  exists(key) {
    return this.storage.getItem(this._getKey(key)) !== null
  }

  /**
   * 스토리지 크기 확인 (대략적)
   */
  getSize() {
    try {
      let total = 0
      const keys = Object.keys(this.storage)
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          total += this.storage.getItem(key).length
        }
      })
      return total
    } catch (error) {
      return 0
    }
  }
}

/**
 * 인증 토큰 관리
 */
class AuthTokenManager extends BaseStorage {
  /**
   * 액세스 토큰 저장
   */
  setAccessToken(token) {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token)
  }

  /**
   * 액세스 토큰 가져오기
   */
  getAccessToken() {
    return this.get(STORAGE_KEYS.AUTH_TOKEN)
  }

  /**
   * 리프레시 토큰 저장
   */
  setRefreshToken(token) {
    return this.set(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  /**
   * 리프레시 토큰 가져오기
   */
  getRefreshToken() {
    return this.get(STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * 세션 만료 시간 설정
   */
  setSessionExpiry(expiry) {
    return this.set(STORAGE_KEYS.SESSION_EXPIRY, expiry)
  }

  /**
   * 세션 만료 시간 가져오기
   */
  getSessionExpiry() {
    return this.get(STORAGE_KEYS.SESSION_EXPIRY)
  }

  /**
   * 토큰 유효성 확인
   */
  isTokenValid() {
    const token = this.getAccessToken()
    const expiry = this.getSessionExpiry()

    if (!token || !expiry) return false

    return new Date().getTime() < new Date(expiry).getTime()
  }

  /**
   * 모든 인증 데이터 삭제
   */
  clearAuthData() {
    this.remove(STORAGE_KEYS.AUTH_TOKEN)
    this.remove(STORAGE_KEYS.REFRESH_TOKEN)
    this.remove(STORAGE_KEYS.SESSION_EXPIRY)
    this.remove(STORAGE_KEYS.USER_DATA)
  }
}

/**
 * 사용자 데이터 관리
 */
class UserDataManager extends BaseStorage {
  /**
   * 사용자 정보 저장
   */
  setUserData(userData) {
    return this.set(STORAGE_KEYS.USER_DATA, userData)
  }

  /**
   * 사용자 정보 가져오기
   */
  getUserData() {
    return this.get(STORAGE_KEYS.USER_DATA, null)
  }

  /**
   * 사용자 설정 저장
   */
  setUserPreferences(preferences) {
    const currentPrefs = this.getUserPreferences()
    const mergedPrefs = { ...currentPrefs, ...preferences }
    return this.set(STORAGE_KEYS.USER_PREFERENCES, mergedPrefs)
  }

  /**
   * 사용자 설정 가져오기
   */
  getUserPreferences() {
    return this.get(STORAGE_KEYS.USER_PREFERENCES, {})
  }

  /**
   * 앱 설정 저장
   */
  setAppSettings(settings) {
    const currentSettings = this.getAppSettings()
    const mergedSettings = { ...currentSettings, ...settings }
    return this.set(STORAGE_KEYS.APP_SETTINGS, mergedSettings)
  }

  /**
   * 앱 설정 가져오기
   */
  getAppSettings() {
    return this.get(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS)
  }

  /**
   * 특정 설정값 업데이트
   */
  updateSetting(category, key, value) {
    const settings = this.getAppSettings()
    if (!settings[category]) {
      settings[category] = {}
    }
    settings[category][key] = value
    return this.setAppSettings(settings)
  }

  /**
   * 언어 설정
   */
  setUILanguage(language) {
    return this.set(STORAGE_KEYS.UI_LANGUAGE, language)
  }

  getUILanguage() {
    return this.get(STORAGE_KEYS.UI_LANGUAGE, "en")
  }

  setNativeLanguage(language) {
    return this.set(STORAGE_KEYS.NATIVE_LANGUAGE, language)
  }

  getNativeLanguage() {
    return this.get(STORAGE_KEYS.NATIVE_LANGUAGE, "en")
  }
}

/**
 * 학습 진행상황 관리
 */
class LearningProgressManager extends BaseStorage {
  /**
   * 학습 진행상황 저장
   */
  setLearningProgress(productId, progress) {
    const allProgress = this.getAllProgress()
    allProgress[productId] = {
      ...allProgress[productId],
      ...progress,
      lastUpdated: new Date().toISOString(),
    }
    return this.set(STORAGE_KEYS.LEARNING_PROGRESS, allProgress)
  }

  /**
   * 특정 상품의 진행상황 가져오기
   */
  getLearningProgress(productId) {
    const allProgress = this.getAllProgress()
    return allProgress[productId] || {}
  }

  /**
   * 모든 진행상황 가져오기
   */
  getAllProgress() {
    return this.get(STORAGE_KEYS.LEARNING_PROGRESS, {})
  }

  /**
   * 일일 진행상황 저장
   */
  setDailyProgress(date, progress) {
    const dailyProgress = this.getDailyProgress()
    dailyProgress[date] = progress
    return this.set(STORAGE_KEYS.DAILY_PROGRESS, dailyProgress)
  }

  /**
   * 일일 진행상황 가져오기
   */
  getDailyProgress(date = null) {
    const dailyProgress = this.get(STORAGE_KEYS.DAILY_PROGRESS, {})
    return date ? dailyProgress[date] || {} : dailyProgress
  }

  /**
   * 오늘의 진행상황 가져오기
   */
  getTodayProgress() {
    const today = new Date().toISOString().split("T")[0]
    return this.getDailyProgress(today)
  }

  /**
   * 학습 목표 설정
   */
  setStudyGoals(goals) {
    return this.set(STORAGE_KEYS.STUDY_GOALS, goals)
  }

  /**
   * 학습 목표 가져오기
   */
  getStudyGoals() {
    return this.get(STORAGE_KEYS.STUDY_GOALS, {
      dailyMinutes: 15,
      weeklyDays: 5,
      monthlyTopics: 3,
    })
  }
}

/**
 * 캐시 데이터 관리
 */
class CacheManager extends BaseStorage {
  constructor() {
    super()
    this.cacheExpiry = 24 * 60 * 60 * 1000 // 24시간
  }

  /**
   * 만료 시간 포함하여 캐시 저장
   */
  setCacheData(key, data, customExpiry = null) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiry: customExpiry || this.cacheExpiry,
    }
    return this.set(key, cacheItem)
  }

  /**
   * 캐시 데이터 가져오기 (만료 확인 포함)
   */
  getCacheData(key) {
    const cacheItem = this.get(key)

    if (!cacheItem || !cacheItem.timestamp) {
      return null
    }

    // 만료 확인
    if (Date.now() - cacheItem.timestamp > cacheItem.expiry) {
      this.remove(key)
      return null
    }

    return cacheItem.data
  }

  /**
   * 번역 캐시 관리
   */
  setTranslationCache(sourceText, targetLang, translation) {
    const cacheKey = `${STORAGE_KEYS.TRANSLATION_CACHE}_${sourceText}_${targetLang}`
    return this.setCacheData(cacheKey, translation, 7 * 24 * 60 * 60 * 1000) // 7일
  }

  getTranslationCache(sourceText, targetLang) {
    const cacheKey = `${STORAGE_KEYS.TRANSLATION_CACHE}_${sourceText}_${targetLang}`
    return this.getCacheData(cacheKey)
  }

  /**
   * API 응답 캐시
   */
  setAPICache(endpoint, params, response) {
    const cacheKey = `${STORAGE_KEYS.API_CACHE}_${endpoint}_${JSON.stringify(params)}`
    return this.setCacheData(cacheKey, response, 60 * 60 * 1000) // 1시간
  }

  getAPICache(endpoint, params) {
    const cacheKey = `${STORAGE_KEYS.API_CACHE}_${endpoint}_${JSON.stringify(params)}`
    return this.getCacheData(cacheKey)
  }

  /**
   * 만료된 캐시 정리
   */
  cleanupExpiredCache() {
    try {
      const keys = Object.keys(this.storage)
      let cleanedCount = 0

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const value = this.get(key.replace(this.prefix, ""))
          if (value && value.timestamp && value.expiry) {
            if (Date.now() - value.timestamp > value.expiry) {
              this.storage.removeItem(key)
              cleanedCount++
            }
          }
        }
      })

      console.log(`만료된 캐시 ${cleanedCount}개 정리 완료`)
      return cleanedCount
    } catch (error) {
      console.error("캐시 정리 실패:", error)
      return 0
    }
  }
}

/**
 * 상품별 설정 관리
 */
class ProductSettingsManager extends BaseStorage {
  /**
   * Talk Like You Mean It 설정
   */
  setTalkSettings(settings) {
    return this.set(STORAGE_KEYS.TALK_SETTINGS, settings)
  }

  getTalkSettings() {
    return this.get(STORAGE_KEYS.TALK_SETTINGS, {
      voiceSpeed: 1.0,
      emotionSensitivity: "medium",
      conversationStyle: "friendly",
      correctionLevel: "gentle",
    })
  }

  /**
   * Drama Builder 설정
   */
  setDramaSettings(settings) {
    return this.set(STORAGE_KEYS.DRAMA_SETTINGS, settings)
  }

  getDramaSettings() {
    return this.get(STORAGE_KEYS.DRAMA_SETTINGS, {
      showTranslations: true,
      autoCheck: false,
      difficulty: "auto",
      genrePreference: "mixed",
    })
  }

  /**
   * Test & Study 설정
   */
  setTestSettings(settings) {
    return this.set(STORAGE_KEYS.TEST_SETTINGS, settings)
  }

  getTestSettings() {
    return this.get(STORAGE_KEYS.TEST_SETTINGS, {
      timeLimit: true,
      showExplanations: true,
      retakeIncorrect: true,
      focusAreas: [],
    })
  }

  /**
   * Korean Journey 설정
   */
  setJourneySettings(settings) {
    return this.set(STORAGE_KEYS.JOURNEY_SETTINGS, settings)
  }

  getJourneySettings() {
    return this.get(STORAGE_KEYS.JOURNEY_SETTINGS, {
      readingSpeed: "normal",
      pronunciationFeedback: true,
      shadowReading: false,
      contentType: "mixed",
    })
  }
}

/**
 * 오프라인 데이터 관리
 */
class OfflineDataManager extends BaseStorage {
  /**
   * 오프라인 사용을 위한 데이터 저장
   */
  setOfflineData(productId, data) {
    const offlineData = this.getOfflineData()
    offlineData[productId] = {
      ...data,
      savedAt: new Date().toISOString(),
    }
    return this.set(STORAGE_KEYS.OFFLINE_DATA, offlineData)
  }

  /**
   * 오프라인 데이터 가져오기
   */
  getOfflineData(productId = null) {
    const offlineData = this.get(STORAGE_KEYS.OFFLINE_DATA, {})
    return productId ? offlineData[productId] || {} : offlineData
  }

  /**
   * 동기화 대기 중인 데이터 저장
   */
  addPendingSync(action, data) {
    const pendingData = this.get("pending_sync", [])
    pendingData.push({
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
    })
    return this.set("pending_sync", pendingData)
  }

  /**
   * 동기화 대기 데이터 가져오기
   */
  getPendingSync() {
    return this.get("pending_sync", [])
  }

  /**
   * 동기화 완료된 데이터 제거
   */
  removeSyncedData(id) {
    const pendingData = this.getPendingSync()
    const filteredData = pendingData.filter((item) => item.id !== id)
    return this.set("pending_sync", filteredData)
  }
}

/**
 * 에러 로깅 관리
 */
class ErrorLogManager extends BaseStorage {
  /**
   * 에러 로그 저장
   */
  logError(error, context = "") {
    const errorLogs = this.getErrorLogs()
    const errorLog = {
      id: Date.now().toString(),
      message: error.message || error,
      stack: error.stack || "",
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    errorLogs.unshift(errorLog)

    // 최대 100개 로그만 유지
    if (errorLogs.length > 100) {
      errorLogs.splice(100)
    }

    return this.set(STORAGE_KEYS.ERROR_LOGS, errorLogs)
  }

  /**
   * 에러 로그 가져오기
   */
  getErrorLogs() {
    return this.get(STORAGE_KEYS.ERROR_LOGS, [])
  }

  /**
   * 에러 로그 정리
   */
  clearErrorLogs() {
    return this.set(STORAGE_KEYS.ERROR_LOGS, [])
  }
}

/**
 * 통합 스토리지 매니저
 */
class StorageManager {
  constructor() {
    this.auth = new AuthTokenManager()
    this.user = new UserDataManager()
    this.learning = new LearningProgressManager()
    this.cache = new CacheManager()
    this.products = new ProductSettingsManager()
    this.offline = new OfflineDataManager()
    this.errors = new ErrorLogManager()

    // 초기화 시 만료된 캐시 정리
    this.cache.cleanupExpiredCache()
  }

  /**
   * 전체 데이터 내보내기
   */
  exportAllData() {
    try {
      const data = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        auth: {
          userData: this.user.getUserData(),
          preferences: this.user.getUserPreferences(),
          settings: this.user.getAppSettings(),
        },
        learning: {
          progress: this.learning.getAllProgress(),
          dailyProgress: this.learning.getDailyProgress(),
          goals: this.learning.getStudyGoals(),
        },
        products: {
          talk: this.products.getTalkSettings(),
          drama: this.products.getDramaSettings(),
          test: this.products.getTestSettings(),
          journey: this.products.getJourneySettings(),
        },
      }

      return data
    } catch (error) {
      console.error("데이터 내보내기 실패:", error)
      return null
    }
  }

  /**
   * 데이터 가져오기
   */
  importData(importedData) {
    try {
      if (!importedData || !importedData.version) {
        throw new Error("유효하지 않은 데이터 형식")
      }

      // 인증 데이터 복원
      if (importedData.auth) {
        if (importedData.auth.preferences) {
          this.user.setUserPreferences(importedData.auth.preferences)
        }
        if (importedData.auth.settings) {
          this.user.setAppSettings(importedData.auth.settings)
        }
      }

      // 학습 데이터 복원
      if (importedData.learning) {
        if (importedData.learning.goals) {
          this.learning.setStudyGoals(importedData.learning.goals)
        }
      }

      // 상품 설정 복원
      if (importedData.products) {
        if (importedData.products.talk) {
          this.products.setTalkSettings(importedData.products.talk)
        }
        if (importedData.products.drama) {
          this.products.setDramaSettings(importedData.products.drama)
        }
        if (importedData.products.test) {
          this.products.setTestSettings(importedData.products.test)
        }
        if (importedData.products.journey) {
          this.products.setJourneySettings(importedData.products.journey)
        }
      }

      return true
    } catch (error) {
      console.error("데이터 가져오기 실패:", error)
      this.errors.logError(error, "importData")
      return false
    }
  }

  /**
   * 모든 데이터 삭제 (계정 삭제 시)
   */
  clearAllData() {
    try {
      this.auth.clearAuthData()
      this.user.clear()
      this.learning.clear()
      this.cache.clear()
      this.products.clear()
      this.offline.clear()
      this.errors.clear()

      return true
    } catch (error) {
      console.error("데이터 삭제 실패:", error)
      return false
    }
  }

  /**
   * 스토리지 사용량 확인
   */
  getStorageUsage() {
    try {
      return {
        auth: this.auth.getSize(),
        user: this.user.getSize(),
        learning: this.learning.getSize(),
        cache: this.cache.getSize(),
        products: this.products.getSize(),
        offline: this.offline.getSize(),
        errors: this.errors.getSize(),
        total:
          this.auth.getSize() +
          this.user.getSize() +
          this.learning.getSize() +
          this.cache.getSize() +
          this.products.getSize() +
          this.offline.getSize() +
          this.errors.getSize(),
      }
    } catch (error) {
      console.error("스토리지 사용량 확인 실패:", error)
      return { total: 0 }
    }
  }
}

// 싱글톤 인스턴스 생성
const storage = new StorageManager()

// 브라우저 지원 확인
const isStorageSupported = () => {
  try {
    const test = "test"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (error) {
    return false
  }
}

// 스토리지 이벤트 리스너 (다른 탭에서의 변경사항 감지)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith("spitkorean_")) {
      console.log("다른 탭에서 스토리지 변경 감지:", event.key)

      // 특정 키에 대한 이벤트 발행 (필요시)
      if (event.key.includes("auth_token")) {
        // 인증 상태 변경 이벤트
        window.dispatchEvent(
          new CustomEvent("authTokenChanged", {
            detail: { newValue: event.newValue, oldValue: event.oldValue },
          }),
        )
      }
    }
  })
}

// ===== FUNÇÕES AUXILIARES PARA COMPATIBILIDADE =====

/**
 * Função para obter idioma armazenado (compatibilidade com useLanguage)
 */
export const getStoredLanguage = () => {
  return storage.user.getUILanguage()
}

/**
 * Função para definir idioma armazenado (compatibilidade com useLanguage)
 */
export const setStoredLanguage = (language) => {
  return storage.user.setUILanguage(language)
}

/**
 * Função para obter idioma nativo armazenado
 */
export const getStoredNativeLanguage = () => {
  return storage.user.getNativeLanguage()
}

/**
 * Função para definir idioma nativo armazenado
 */
export const setStoredNativeLanguage = (language) => {
  return storage.user.setNativeLanguage(language)
}

/**
 * Função para obter configurações de tradução
 */
export const getTranslationSettings = () => {
  const settings = storage.user.getAppSettings()
  return {
    uiLanguage: storage.user.getUILanguage(),
    nativeLanguage: storage.user.getNativeLanguage(),
    autoTranslate: settings.app?.autoTranslate ?? true,
    showOriginal: settings.app?.showOriginal ?? false,
    translationProvider: settings.app?.translationProvider ?? "google",
  }
}

/**
 * Função para definir configurações de tradução
 */
export const setTranslationSettings = (settings) => {
  if (settings.uiLanguage) {
    storage.user.setUILanguage(settings.uiLanguage)
  }
  if (settings.nativeLanguage) {
    storage.user.setNativeLanguage(settings.nativeLanguage)
  }

  // Atualizar outras configurações
  const appSettings = storage.user.getAppSettings()
  const updatedSettings = {
    ...appSettings,
    app: {
      ...appSettings.app,
      autoTranslate: settings.autoTranslate ?? appSettings.app?.autoTranslate,
      showOriginal: settings.showOriginal ?? appSettings.app?.showOriginal,
      translationProvider: settings.translationProvider ?? appSettings.app?.translationProvider,
    },
  }

  return storage.user.setAppSettings(updatedSettings)
}

export default storage
export {
  StorageManager,
  AuthTokenManager,
  UserDataManager,
  LearningProgressManager,
  CacheManager,
  ProductSettingsManager,
  OfflineDataManager,
  ErrorLogManager,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  isStorageSupported,
}
