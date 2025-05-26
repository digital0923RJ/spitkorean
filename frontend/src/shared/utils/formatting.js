// frontend/src/shared/utils/formatting.js

/**
 * 포맷팅 유틸리티 함수들
 * 날짜, 시간, 숫자, 텍스트 등의 형식을 일관되게 처리
 */

// 날짜 포맷팅
export const formatDate = (date, format = 'default', locale = 'ko-KR') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const formats = {
    default: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    short: { month: '2-digit', day: '2-digit' },
    yearMonth: { year: 'numeric', month: 'long' },
    relative: null // 별도 처리
  };
  
  if (format === 'relative') {
    return formatRelativeDate(dateObj, locale);
  }
  
  const options = formats[format] || formats.default;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// 상대적 날짜 포맷팅 (예: "3일 전", "2시간 후")
export const formatRelativeDate = (date, locale = 'ko-KR') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = (now - dateObj) / 1000;
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-Math.round(diffInSeconds), 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(-Math.round(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(-Math.round(diffInSeconds / 3600), 'hour');
  } else if (Math.abs(diffInSeconds) < 2592000) {
    return rtf.format(-Math.round(diffInSeconds / 86400), 'day');
  } else if (Math.abs(diffInSeconds) < 31536000) {
    return rtf.format(-Math.round(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.round(diffInSeconds / 31536000), 'year');
  }
};

// 시간 포맷팅
export const formatTime = (date, format = '24h', locale = 'ko-KR') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = format === '12h' 
    ? { hour: 'numeric', minute: '2-digit', hour12: true }
    : { hour: '2-digit', minute: '2-digit', hour12: false };
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// 날짜/시간 포맷팅
export const formatDateTime = (date, locale = 'ko-KR') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// 숫자 포맷팅
export const formatNumber = (number, options = {}, locale = 'ko-KR') => {
  if (number === null || number === undefined || isNaN(number)) return '';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return new Intl.NumberFormat(locale, finalOptions).format(number);
};

// 통화 포맷팅
export const formatCurrency = (amount, currency = 'USD', locale = 'ko-KR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// 백분율 포맷팅
export const formatPercentage = (value, decimals = 1, locale = 'ko-KR') => {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

// 파일 크기 포맷팅
export const formatFileSize = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 시간 지속시간 포맷팅 (초 단위를 시:분:초로)
export const formatDuration = (seconds, format = 'full') => {
  if (!seconds || isNaN(seconds)) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (format === 'compact') {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}초`);
  
  return parts.join(' ');
};

// 전화번호 포맷팅
export const formatPhoneNumber = (phoneNumber, country = 'KR') => {
  if (!phoneNumber) return '';
  
  // 숫자만 추출
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (country === 'KR') {
    // 한국 전화번호 형식
    if (cleaned.length === 11) {
      // 010-1234-5678
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
      // 02-123-4567 또는 031-123-4567
      if (cleaned.startsWith('02')) {
        return cleaned.replace(/(\d{2})(\d{3,4})(\d{4})/, '$1-$2-$3');
      } else {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    }
  } else if (country === 'US') {
    // 미국 전화번호 형식
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
  }
  
  return phoneNumber; // 포맷팅 실패 시 원본 반환
};

// 신용카드 번호 포맷팅
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  return formatted;
};

// 신용카드 번호 마스킹
export const maskCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cardNumber;
  
  const last4 = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4) + last4;
  
  return formatCreditCard(masked);
};

// 이메일 마스킹
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
};

// 텍스트 줄임말 (말줄임표)
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// 단어 단위로 텍스트 줄임
export const truncateWords = (text, maxWords, suffix = '...') => {
  if (!text) return '';
  
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  
  return words.slice(0, maxWords).join(' ') + suffix;
};

// 카멜케이스를 읽기 쉬운 형태로 변환
export const formatCamelCase = (camelCase) => {
  if (!camelCase) return '';
  
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// 첫 글자 대문자
export const capitalize = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// 각 단어의 첫 글자 대문자
export const titleCase = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// 한국어 조사 처리 (은/는, 이/가, 을/를)
export const formatKoreanParticle = (word, particle) => {
  if (!word) return '';
  
  const lastChar = word.charAt(word.length - 1);
  const lastCharCode = lastChar.charCodeAt(0);
  
  // 한글인지 확인
  if (lastCharCode < 0xAC00 || lastCharCode > 0xD7A3) {
    return word + particle; // 한글이 아니면 그대로 반환
  }
  
  // 받침 여부 확인
  const hasFinalConsonant = (lastCharCode - 0xAC00) % 28 !== 0;
  
  const particles = {
    '은는': hasFinalConsonant ? '은' : '는',
    '이가': hasFinalConsonant ? '이' : '가',
    '을를': hasFinalConsonant ? '을' : '를',
    '과와': hasFinalConsonant ? '과' : '와',
    '아야': hasFinalConsonant ? '아' : '야'
  };
  
  const selectedParticle = particles[particle] || particle;
  return word + selectedParticle;
};

// 숫자를 한국어 순서로 변환 (1 -> 첫 번째)
export const formatKoreanOrdinal = (number) => {
  if (!number || isNaN(number)) return '';
  
  const ordinals = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  
  if (number <= 10) {
    return ordinals[number - 1] + ' 번째';
  } else {
    return `${number} 번째`;
  }
};

// URL 슬러그 생성
export const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/[\s_-]+/g, '-') // 공백을 하이픈으로
    .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
};

// HTML 태그 제거
export const stripHtml = (html) => {
  if (!html) return '';
  
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// 줄바꿈을 <br> 태그로 변환
export const nl2br = (text) => {
  if (!text) return '';
  
  return text.replace(/\n/g, '<br>');
};

// 색상 헥스 코드 검증 및 포맷팅
export const formatHexColor = (color) => {
  if (!color) return '';
  
  // # 제거
  let hex = color.replace('#', '');
  
  // 3자리를 6자리로 확장
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // 유효성 검사
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return '';
  }
  
  return '#' + hex.toUpperCase();
};

// 배열을 자연어로 연결 (예: ["사과", "바나나", "포도"] -> "사과, 바나나 그리고 포도")
export const formatList = (items, conjunction = '그리고', locale = 'ko-KR') => {
  if (!items || !Array.isArray(items) || items.length === 0) return '';
  
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(` ${conjunction} `);
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return otherItems.join(', ') + ` ${conjunction} ` + lastItem;
};

// 레벨 표시 포맷팅
export const formatLevel = (level) => {
  const levelMap = {
    'beginner': '초급',
    'intermediate': '중급', 
    'advanced': '고급',
    'level1': 'Level 1',
    'level2': 'Level 2',
    'level3': 'Level 3',
    'level4': 'Level 4'
  };
  
  return levelMap[level] || level;
};

// TOPIK 급수 포맷팅
export const formatTopikLevel = (level) => {
  if (!level) return '';
  
  const num = parseInt(level);
  if (isNaN(num) || num < 1 || num > 6) return level;
  
  const section = num <= 2 ? 'TOPIK I' : 'TOPIK II';
  return `${section} - ${num}급`;
};

// 학습 진도 포맷팅
export const formatProgress = (current, total) => {
  if (!current || !total || total === 0) return '0%';
  
  const percentage = Math.min((current / total) * 100, 100);
  return `${Math.round(percentage)}%`;
};

// 점수 등급 포맷팅
export const formatGrade = (score) => {
  if (score === null || score === undefined || isNaN(score)) return '';
  
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

// 사용량 표시 포맷팅
export const formatUsage = (used, limit) => {
  if (!limit) return `${used || 0}`;
  
  return `${used || 0} / ${limit}`;
};

// 남은 시간 포맷팅
export const formatTimeRemaining = (endDate) => {
  if (!endDate) return '';
  
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  
  if (diff <= 0) return '만료됨';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}일 ${hours}시간 남음`;
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  return `${minutes}분 남음`;
};