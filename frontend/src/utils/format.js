import { PRODUCTS, BUNDLES, calculateBundlePrice } from '@shared/constants/products'
import { 
  CONVERSATION_LEVELS, 
  TOPIK_LEVELS, 
  JOURNEY_LEVELS, 
  DRAMA_LEVELS 
} from '@shared/constants/levels'

/**
 * 날짜 및 시간 포맷팅 유틸리티
 */
export const dateUtils = {
  /**
   * 날짜를 한국어 형식으로 포맷
   * @param {Date|string} date - 포맷할 날짜
   * @param {object} options - 포맷 옵션
   * @returns {string} 포맷된 날짜 문자열
   */
  formatKoreanDate: (date, options = {}) => {
    const {
      includeTime = false,
      includeSeconds = false,
      includeDay = false,
      format = 'long' // 'long', 'short', 'numeric'
    } = options

    if (!date) return '날짜 없음'
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '잘못된 날짜'

    const formatOptions = {
      year: 'numeric',
      month: format === 'numeric' ? 'numeric' : format === 'short' ? 'short' : 'long',
      day: 'numeric',
      timeZone: 'Asia/Seoul'
    }

    if (includeDay) {
      formatOptions.weekday = format === 'short' ? 'short' : 'long'
    }

    if (includeTime) {
      formatOptions.hour = 'numeric'
      formatOptions.minute = 'numeric'
      formatOptions.hour12 = true
      
      if (includeSeconds) {
        formatOptions.second = 'numeric'
      }
    }

    return dateObj.toLocaleDateString('ko-KR', formatOptions)
  },

  /**
   * 상대적 시간 표시 (예: "3분 전", "2시간 전")
   * @param {Date|string} date - 기준 날짜
   * @returns {string} 상대적 시간 문자열
   */
  formatRelativeTime: (date) => {
    if (!date) return '날짜 없음'
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '잘못된 날짜'

    const now = new Date()
    const diffMs = now - dateObj
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffWeeks < 4) return `${diffWeeks}주 전`
    if (diffMonths < 12) return `${diffMonths}개월 전`
    return `${diffYears}년 전`
  },

  /**
   * D-Day 계산 (예: "D-7", "D+3")
   * @param {Date|string} targetDate - 목표 날짜
   * @returns {string} D-Day 문자열
   */
  formatDDay: (targetDate) => {
    if (!targetDate) return 'D-?'
    
    const target = new Date(targetDate)
    if (isNaN(target.getTime())) return 'D-?'

    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'D-Day'
    if (diffDays > 0) return `D-${diffDays}`
    return `D+${Math.abs(diffDays)}`
  },

  /**
   * 학습 시간 포맷 (분 → 시간분)
   * @param {number} minutes - 분 단위 시간
   * @returns {string} 포맷된 시간 문자열
   */
  formatStudyTime: (minutes) => {
    if (!minutes || minutes < 0) return '0분'
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) return `${remainingMinutes}분`
    if (remainingMinutes === 0) return `${hours}시간`
    return `${hours}시간 ${remainingMinutes}분`
  }
}

/**
 * 숫자 포맷팅 유틸리티
 */
export const numberUtils = {
  /**
   * 숫자에 천 단위 구분자 추가
   * @param {number} number - 포맷할 숫자
   * @returns {string} 포맷된 숫자 문자열
   */
  formatNumber: (number) => {
    if (typeof number !== 'number' || isNaN(number)) return '0'
    return number.toLocaleString('ko-KR')
  },

  /**
   * 가격 포맷팅 (USD)
   * @param {number} price - 가격
   * @param {object} options - 포맷 옵션
   * @returns {string} 포맷된 가격 문자열
   */
  formatPrice: (price, options = {}) => {
    const {
      currency = 'USD',
      showCurrency = true,
      decimals = 2
    } = options

    if (typeof price !== 'number' || isNaN(price)) return '$0.00'

    const formatted = price.toFixed(decimals)
    
    if (showCurrency) {
      return currency === 'USD' ? `$${formatted}` : `${formatted} ${currency}`
    }
    
    return formatted
  },

  /**
   * 퍼센티지 포맷팅
   * @param {number} value - 값 (0-100 또는 0-1)
   * @param {object} options - 포맷 옵션
   * @returns {string} 포맷된 퍼센티지 문자열
   */
  formatPercentage: (value, options = {}) => {
    const {
      decimals = 1,
      isDecimal = false // true면 0-1 범위, false면 0-100 범위
    } = options

    if (typeof value !== 'number' || isNaN(value)) return '0%'

    const percentage = isDecimal ? value * 100 : value
    return `${percentage.toFixed(decimals)}%`
  },

  /**
   * XP 포맷팅 (천 단위 축약)
   * @param {number} xp - XP 값
   * @returns {string} 포맷된 XP 문자열
   */
  formatXP: (xp) => {
    if (typeof xp !== 'number' || isNaN(xp)) return '0 XP'

    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M XP`
    }
    if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K XP`
    }
    return `${xp} XP`
  },

  /**
   * 점수 포맷팅 (색상 클래스 포함)
   * @param {number} score - 점수 (0-100)
   * @returns {object} 포맷된 점수와 색상 정보
   */
  formatScore: (score) => {
    if (typeof score !== 'number' || isNaN(score)) {
      return { text: '0점', color: 'text-gray-500', bg: 'bg-gray-100' }
    }

    const formattedScore = `${Math.round(score)}점`
    
    if (score >= 90) {
      return { text: formattedScore, color: 'text-green-700', bg: 'bg-green-100' }
    } else if (score >= 80) {
      return { text: formattedScore, color: 'text-blue-700', bg: 'bg-blue-100' }
    } else if (score >= 70) {
      return { text: formattedScore, color: 'text-yellow-700', bg: 'bg-yellow-100' }
    } else if (score >= 60) {
      return { text: formattedScore, color: 'text-orange-700', bg: 'bg-orange-100' }
    } else {
      return { text: formattedScore, color: 'text-red-700', bg: 'bg-red-100' }
    }
  }
}

/**
 * 텍스트 포맷팅 유틸리티
 */
export const textUtils = {
  /**
   * 텍스트 말줄임 처리
   * @param {string} text - 원본 텍스트
   * @param {number} maxLength - 최대 길이
   * @param {string} suffix - 말줄임 표시
   * @returns {string} 말줄임 처리된 텍스트
   */
  truncate: (text, maxLength = 50, suffix = '...') => {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + suffix
  },

  /**
   * 첫 글자 대문자 변환
   * @param {string} text - 원본 텍스트
   * @returns {string} 첫 글자가 대문자인 텍스트
   */
  capitalize: (text) => {
    if (!text || typeof text !== 'string') return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  /**
   * 단어 단위 제한
   * @param {string} text - 원본 텍스트
   * @param {number} wordLimit - 단어 제한 수
   * @returns {string} 단어 제한된 텍스트
   */
  limitWords: (text, wordLimit = 10) => {
    if (!text || typeof text !== 'string') return ''
    const words = text.split(' ')
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(' ') + '...'
  },

  /**
   * HTML 태그 제거
   * @param {string} html - HTML 문자열
   * @returns {string} 태그가 제거된 텍스트
   */
  stripHtml: (html) => {
    if (!html || typeof html !== 'string') return ''
    return html.replace(/<[^>]*>/g, '')
  },

  /**
   * 줄바꿈을 <br> 태그로 변환
   * @param {string} text - 원본 텍스트
   * @returns {string} 변환된 HTML 문자열
   */
  nl2br: (text) => {
    if (!text || typeof text !== 'string') return ''
    return text.replace(/\n/g, '<br>')
  }
}

/**
 * SpitKorean 전용 포맷팅 유틸리티
 */
export const spitKoreanUtils = {
  /**
   * 상품 정보 포맷팅
   * @param {string} productId - 상품 ID
   * @returns {object} 포맷된 상품 정보
   */
  formatProduct: (productId) => {
    const product = PRODUCTS[productId?.toUpperCase()]
    
    if (!product) {
      return {
        name: '알 수 없는 상품',
        price: '$0.00',
        dailyLimit: '제한 없음',
        description: '상품 정보를 찾을 수 없습니다.'
      }
    }

    return {
      ...product,
      price: numberUtils.formatPrice(product.price),
      dailyLimit: product.dailyLimit ? `일일 ${product.dailyLimit}회` : '무제한'
    }
  },

  /**
   * 번들 가격 포맷팅
   * @param {array} selectedProducts - 선택된 상품 ID 배열
   * @returns {object} 포맷된 번들 정보
   */
  formatBundle: (selectedProducts = []) => {
    if (selectedProducts.length < 2) {
      return {
        originalPrice: '$0.00',
        bundlePrice: '$0.00',
        savings: '$0.00',
        discount: '0%',
        isValid: false
      }
    }

    const originalPrice = selectedProducts.reduce((sum, productId) => {
      const product = PRODUCTS[productId?.toUpperCase()]
      return sum + (product?.price || 0)
    }, 0)

    const bundlePrice = calculateBundlePrice(selectedProducts)
    const savings = originalPrice - bundlePrice
    const discountPercentage = ((savings / originalPrice) * 100).toFixed(0)

    let bundleType = ''
    if (selectedProducts.length === 2) bundleType = 'BUNDLE_2'
    else if (selectedProducts.length === 3) bundleType = 'BUNDLE_3'
    else if (selectedProducts.length >= 4) bundleType = 'BUNDLE_ALL'

    return {
      originalPrice: numberUtils.formatPrice(originalPrice),
      bundlePrice: numberUtils.formatPrice(bundlePrice),
      savings: numberUtils.formatPrice(savings),
      discount: `${discountPercentage}%`,
      bundleType,
      bundleName: BUNDLES[bundleType]?.name || '',
      isValid: true
    }
  },

  /**
   * 레벨 정보 포맷팅
   * @param {string|number} level - 레벨 값
   * @param {string} type - 레벨 타입 (conversation, topik, journey, drama)
   * @returns {object} 포맷된 레벨 정보
   */
  formatLevel: (level, type = 'conversation') => {
    let levelInfo = null

    switch (type) {
      case 'conversation':
      case 'talk':
        levelInfo = CONVERSATION_LEVELS[level?.toUpperCase()]
        break
      case 'topik':
      case 'test':
        levelInfo = TOPIK_LEVELS[parseInt(level)]
        break
      case 'journey':
        levelInfo = JOURNEY_LEVELS[level?.toUpperCase()]
        break
      case 'drama':
        levelInfo = DRAMA_LEVELS[level?.toUpperCase()]
        break
    }

    if (!levelInfo) {
      return {
        name: '알 수 없는 레벨',
        description: '레벨 정보를 찾을 수 없습니다.',
        color: 'gray'
      }
    }

    return {
      ...levelInfo,
      displayName: levelInfo.nameKr || levelInfo.name,
      colorClass: `text-${levelInfo.color}-600`,
      bgClass: `bg-${levelInfo.color}-100`
    }
  },

  /**
   * 구독 상태 포맷팅
   * @param {string} status - 구독 상태
   * @returns {object} 포맷된 상태 정보
   */
  formatSubscriptionStatus: (status) => {
    const statusMap = {
      active: {
        text: '활성',
        color: 'text-green-600',
        bg: 'bg-green-100',
        badge: 'success'
      },
      paused: {
        text: '일시정지',
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        badge: 'warning'
      },
      cancelled: {
        text: '취소됨',
        color: 'text-red-600',
        bg: 'bg-red-100',
        badge: 'error'
      },
      expired: {
        text: '만료됨',
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        badge: 'neutral'
      }
    }

    return statusMap[status] || statusMap.expired
  },

  /**
   * 리그 정보 포맷팅
   * @param {string} league - 리그명
   * @returns {object} 포맷된 리그 정보
   */
  formatLeague: (league) => {
    const leagueMap = {
      bronze: {
        name: '브론즈',
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        icon: '🥉'
      },
      silver: {
        name: '실버',
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        icon: '🥈'
      },
      gold: {
        name: '골드',
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        icon: '🥇'
      },
      diamond: {
        name: '다이아몬드',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        icon: '💎'
      }
    }

    return leagueMap[league] || leagueMap.bronze
  },

  /**
   * 학습 통계 포맷팅
   * @param {object} stats - 학습 통계 객체
   * @returns {object} 포맷된 통계 정보
   */
  formatLearningStats: (stats = {}) => {
    return {
      totalXP: numberUtils.formatXP(stats.totalXP || 0),
      streakDays: `${stats.streakDays || 0}일 연속`,
      studyTime: dateUtils.formatStudyTime(stats.studyTimeTotal || 0),
      averageScore: numberUtils.formatScore(stats.averageScore || 0),
      completedLessons: numberUtils.formatNumber(stats.completedLessons || 0),
      lastActivity: stats.lastActivity ? dateUtils.formatRelativeTime(stats.lastActivity) : '활동 없음'
    }
  },

  /**
   * 사용량 정보 포맷팅
   * @param {object} usage - 사용량 객체
   * @returns {object} 포맷된 사용량 정보
   */
  formatUsage: (usage = {}) => {
    const { used = 0, limit = null, resetDate = null } = usage

    const percentage = limit ? Math.min((used / limit) * 100, 100) : 0
    const remaining = limit ? Math.max(limit - used, 0) : '무제한'

    return {
      used: numberUtils.formatNumber(used),
      limit: limit ? numberUtils.formatNumber(limit) : '무제한',
      remaining: typeof remaining === 'number' ? numberUtils.formatNumber(remaining) : remaining,
      percentage: numberUtils.formatPercentage(percentage),
      resetDate: resetDate ? dateUtils.formatKoreanDate(resetDate) : null,
      status: percentage >= 90 ? 'critical' : percentage >= 70 ? 'warning' : 'normal'
    }
  }
}

/**
 * 파일 크기 포맷팅
 */
export const fileUtils = {
  /**
   * 바이트를 읽기 쉬운 형식으로 변환
   * @param {number} bytes - 바이트 크기
   * @param {number} decimals - 소수점 자릿수
   * @returns {string} 포맷된 파일 크기
   */
  formatFileSize: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}

/**
 * URL 및 경로 포맷팅
 */
export const urlUtils = {
  /**
   * 쿼리 파라미터를 객체로 변환
   * @param {string} queryString - 쿼리 문자열
   * @returns {object} 쿼리 파라미터 객체
   */
  parseQuery: (queryString) => {
    const params = new URLSearchParams(queryString)
    const result = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },

  /**
   * 객체를 쿼리 문자열로 변환
   * @param {object} params - 파라미터 객체
   * @returns {string} 쿼리 문자열
   */
  buildQuery: (params) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    return searchParams.toString()
  }
}

export const formatDate = dateUtils.formatKoreanDate
export const formatPrice = numberUtils.formatPrice

// 기본 내보내기
export default {
  dateUtils,
  numberUtils,
  textUtils,
  spitKoreanUtils,
  fileUtils,
  urlUtils
}