// frontend/src/shared/constants/languages.js

/**
 * SpitKorean 지원 언어 목록
 * 모든 상품에서 공통으로 사용하는 언어 상수
 */

// 지원 언어 목록 (14개 언어)
export const SUPPORTED_LANGUAGES = {
  ko: { 
    name: '한국어', 
    nativeName: '한국어',
    flag: '🇰🇷', 
    direction: 'ltr',
    code: 'ko',
    priority: 1 // 메인 언어
  },
  en: { 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸', 
    direction: 'ltr',
    code: 'en',
    priority: 2 // 주요 언어
  },
  ja: { 
    name: '일본어', 
    nativeName: '日本語',
    flag: '🇯🇵', 
    direction: 'ltr',
    code: 'ja',
    priority: 3
  },
  zh: { 
    name: '중국어', 
    nativeName: '中文',
    flag: '🇨🇳', 
    direction: 'ltr',
    code: 'zh',
    priority: 4
  },
  vi: { 
    name: '베트남어', 
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳', 
    direction: 'ltr',
    code: 'vi',
    priority: 5
  },
  es: { 
    name: '스페인어', 
    nativeName: 'Español',
    flag: '🇪🇸', 
    direction: 'ltr',
    code: 'es',
    priority: 6
  },
  fr: { 
    name: '프랑스어', 
    nativeName: 'Français',
    flag: '🇫🇷', 
    direction: 'ltr',
    code: 'fr',
    priority: 7
  },
  hi: { 
    name: '힌디어', 
    nativeName: 'हिन्दी',
    flag: '🇮🇳', 
    direction: 'ltr',
    code: 'hi',
    priority: 8
  },
  th: { 
    name: '태국어', 
    nativeName: 'ไทย',
    flag: '🇹🇭', 
    direction: 'ltr',
    code: 'th',
    priority: 9
  },
  de: { 
    name: '독일어', 
    nativeName: 'Deutsch',
    flag: '🇩🇪', 
    direction: 'ltr',
    code: 'de',
    priority: 10
  },
  mn: { 
    name: '몽골어', 
    nativeName: 'Монгол',
    flag: '🇲🇳', 
    direction: 'ltr',
    code: 'mn',
    priority: 11
  },
  ar: { 
    name: '아랍어', 
    nativeName: 'العربية',
    flag: '🇸🇦', 
    direction: 'rtl', // 우에서 좌로 읽기
    code: 'ar',
    priority: 12
  },
  pt: { 
    name: '포르투갈어', 
    nativeName: 'Português',
    flag: '🇧🇷', 
    direction: 'ltr',
    code: 'pt',
    priority: 13
  },
  tr: { 
    name: '터키어', 
    nativeName: 'Türkçe',
    flag: '🇹🇷', 
    direction: 'ltr',
    code: 'tr',
    priority: 14
  }
};

// 언어 코드 목록
export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES);

// 우선순위 순으로 정렬된 언어 목록
export const LANGUAGES_BY_PRIORITY = Object.entries(SUPPORTED_LANGUAGES)
  .sort(([, a], [, b]) => a.priority - b.priority)
  .map(([code, info]) => ({ code, ...info }));

// RTL 언어 목록
export const RTL_LANGUAGES = Object.entries(SUPPORTED_LANGUAGES)
  .filter(([, info]) => info.direction === 'rtl')
  .map(([code]) => code);

// 번역 서비스별 언어 매핑
export const TRANSLATION_SERVICE_MAPPING = {
  google: {
    ko: 'ko',
    en: 'en',
    ja: 'ja',
    zh: 'zh-cn',
    vi: 'vi',
    es: 'es',
    fr: 'fr',
    hi: 'hi',
    th: 'th',
    de: 'de',
    mn: 'mn',
    ar: 'ar',
    pt: 'pt',
    tr: 'tr'
  },
  openai: {
    ko: 'Korean',
    en: 'English',
    ja: 'Japanese',
    zh: 'Chinese',
    vi: 'Vietnamese',
    es: 'Spanish',
    fr: 'French',
    hi: 'Hindi',
    th: 'Thai',
    de: 'German',
    mn: 'Mongolian',
    ar: 'Arabic',
    pt: 'Portuguese',
    tr: 'Turkish'
  }
};

// 브라우저 언어 감지 매핑
export const BROWSER_LANGUAGE_MAPPING = {
  'ko': 'ko',
  'ko-KR': 'ko',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'ja': 'ja',
  'ja-JP': 'ja',
  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'vi': 'vi',
  'vi-VN': 'vi',
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'fr': 'fr',
  'fr-FR': 'fr',
  'hi': 'hi',
  'hi-IN': 'hi',
  'th': 'th',
  'th-TH': 'th',
  'de': 'de',
  'de-DE': 'de',
  'mn': 'mn',
  'mn-MN': 'mn',
  'ar': 'ar',
  'ar-SA': 'ar',
  'pt': 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'tr': 'tr',
  'tr-TR': 'tr'
};

// 기본 언어 설정
export const DEFAULT_LANGUAGE = 'en';
export const PRIMARY_LANGUAGE = 'ko'; // 학습 대상 언어

// 언어별 텍스트 방향
export const getTextDirection = (languageCode) => {
  return SUPPORTED_LANGUAGES[languageCode]?.direction || 'ltr';
};

// 브라우저 언어 감지
export const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const mappedLang = BROWSER_LANGUAGE_MAPPING[browserLang];
  
  if (mappedLang && SUPPORTED_LANGUAGES[mappedLang]) {
    return mappedLang;
  }
  
  // 언어 코드만 추출해서 다시 시도
  const langCode = browserLang.split('-')[0];
  const simpleMappedLang = BROWSER_LANGUAGE_MAPPING[langCode];
  
  if (simpleMappedLang && SUPPORTED_LANGUAGES[simpleMappedLang]) {
    return simpleMappedLang;
  }
  
  return DEFAULT_LANGUAGE;
};

// 언어별 폰트 설정 (필요시)
export const LANGUAGE_FONTS = {
  ko: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  ja: '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif',
  zh: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  ar: '"Noto Sans Arabic", "Tahoma", sans-serif',
  hi: '"Noto Sans Devanagari", "Mangal", sans-serif',
  th: '"Noto Sans Thai", "Leelawadee UI", sans-serif',
  // 기타 언어는 시스템 기본 폰트 사용
  default: '"Inter", "Segoe UI", "Roboto", sans-serif'
};

// 언어 유효성 검사
export const isValidLanguage = (languageCode) => {
  return LANGUAGE_CODES.includes(languageCode);
};

// 언어 정보 조회
export const getLanguageInfo = (languageCode) => {
  return SUPPORTED_LANGUAGES[languageCode] || null;
};

// UI 표시용 언어 옵션 생성
export const getLanguageOptions = (includePriority = false) => {
  const languages = includePriority ? LANGUAGES_BY_PRIORITY : Object.entries(SUPPORTED_LANGUAGES);
  
  return languages.map(([code, info]) => ({
    value: code,
    label: info.name,
    nativeLabel: info.nativeName,
    flag: info.flag,
    direction: info.direction,
    priority: info.priority
  }));
};