// frontend/src/shared/utils/validation.js

/**
 * 유효성 검사 유틸리티 함수들
 * 폼 입력값, API 데이터 등의 유효성을 검증
 */

// 이메일 유효성 검사
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// 비밀번호 유효성 검사
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // 최소 8자, 최대 100자
  if (password.length < 8 || password.length > 100) return false;
  
  // 최소 하나의 대문자, 소문자, 숫자 포함
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
};

// 비밀번호 강도 검사
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'none', feedback: [] };
  
  let score = 0;
  const feedback = [];
  
  // 길이 검사
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('최소 8자 이상이어야 합니다');
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // 문자 종류 검사
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해야 합니다');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해야 합니다');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해야 합니다');
  }
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함하면 더 안전합니다');
  }
  
  // 연속된 문자나 반복 검사
  if (!/(.)\1{2,}/.test(password) && !/123|abc|qwe/i.test(password)) {
    score += 1;
  } else {
    feedback.push('연속되거나 반복되는 문자는 피해주세요');
  }
  
  // 레벨 결정
  let level = 'weak';
  if (score >= 6) level = 'strong';
  else if (score >= 4) level = 'medium';
  
  return { score, level, feedback };
};

// 전화번호 유효성 검사
export const isValidPhoneNumber = (phoneNumber, country = 'KR') => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (country === 'KR') {
    // 한국 전화번호: 010-1234-5678, 02-123-4567, 031-123-4567 등
    return /^(010|011|016|017|018|019)\d{7,8}$/.test(cleaned) || 
           /^0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4])\d{7,8}$/.test(cleaned);
  } else if (country === 'US') {
    // 미국 전화번호: 10자리
    return /^\d{10}$/.test(cleaned);
  }
  
  return false;
};

// URL 유효성 검사
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 한국어 이름 유효성 검사
export const isValidKoreanName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  
  // 2-10자, 한글만
  return /^[가-힣]{2,10}$/.test(trimmed);
};

// 영어 이름 유효성 검사
export const isValidEnglishName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  
  // 2-50자, 영문과 공백, 하이픈, 어포스트로피만
  return /^[a-zA-Z\s\-']{2,50}$/.test(trimmed);
};

// 나이 유효성 검사
export const isValidAge = (age) => {
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= 1 && numAge <= 150;
};

// 생년월일 유효성 검사
export const isValidBirthDate = (birthDate) => {
  if (!birthDate) return false;
  
  const date = new Date(birthDate);
  const now = new Date();
  
  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) return false;
  
  // 1900년 이후, 현재 날짜 이전
  const minDate = new Date('1900-01-01');
  return date >= minDate && date <= now;
};

// 신용카드 번호 유효성 검사 (Luhn 알고리즘)
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn 알고리즘
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// 신용카드 타입 검출
export const getCreditCardType = (cardNumber) => {
  if (!cardNumber) return null;
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // 카드사별 패턴
  const patterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    diners: /^3[0689][0-9]{11}$/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return type;
    }
  }
  
  return null;
};

// CVV 유효성 검사
export const isValidCVV = (cvv, cardType = 'visa') => {
  if (!cvv || typeof cvv !== 'string') return false;
  
  const cleaned = cvv.replace(/\D/g, '');
  
  // American Express는 4자리, 나머지는 3자리
  const expectedLength = cardType === 'amex' ? 4 : 3;
  
  return cleaned.length === expectedLength;
};

// 파일 유효성 검사
export const isValidFile = (file, options = {}) => {
  if (!file || !(file instanceof File)) return { valid: false, error: '유효한 파일이 아닙니다' };
  
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [],
    allowedExtensions = []
  } = options;
  
  // 파일 크기 검사
  if (file.size > maxSize) {
    return { valid: false, error: `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다` };
  }
  
  // MIME 타입 검사
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: '허용되지 않는 파일 타입입니다' };
  }
  
  // 확장자 검사
  if (allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: '허용되지 않는 파일 확장자입니다' };
    }
  }
  
  return { valid: true };
};

// 이미지 파일 유효성 검사
export const isValidImage = (file) => {
  return isValidFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  });
};

// 오디오 파일 유효성 검사
export const isValidAudio = (file) => {
  return isValidFile(file, {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    allowedExtensions: ['mp3', 'wav', 'ogg', 'm4a']
  });
};

// 문자열 길이 검사
export const isValidLength = (str, min = 0, max = Infinity) => {
  if (typeof str !== 'string') return false;
  
  const length = str.trim().length;
  return length >= min && length <= max;
};

// 숫자 범위 검사
export const isValidRange = (num, min = -Infinity, max = Infinity) => {
  const number = parseFloat(num);
  if (isNaN(number)) return false;
  
  return number >= min && number <= max;
};

// 정수 검사
export const isValidInteger = (num) => {
  const number = parseFloat(num);
  return !isNaN(number) && Number.isInteger(number);
};

// 양의 정수 검사
export const isValidPositiveInteger = (num) => {
  const number = parseInt(num);
  return !isNaN(number) && number > 0 && Number.isInteger(number);
};

// 배열 검사
export const isValidArray = (arr, minLength = 0, maxLength = Infinity) => {
  if (!Array.isArray(arr)) return false;
  
  return arr.length >= minLength && arr.length <= maxLength;
};

// 객체 검사
export const isValidObject = (obj, requiredKeys = []) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  
  return requiredKeys.every(key => key in obj);
};

// JSON 문자열 검사
export const isValidJSON = (str) => {
  if (typeof str !== 'string') return false;
  
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// 색상 코드 검사 (HEX)
export const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// IP 주소 검사
export const isValidIP = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// 한국어 레벨 검사
export const isValidKoreanLevel = (level) => {
  const validLevels = ['beginner', 'intermediate', 'advanced', 'level1', 'level2', 'level3', 'level4'];
  return validLevels.includes(level);
};

// TOPIK 급수 검사
export const isValidTopikLevel = (level) => {
  const num = parseInt(level);
  return !isNaN(num) && num >= 1 && num <= 6;
};

// 언어 코드 검사 (ISO 639-1)
export const isValidLanguageCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  
  const validCodes = ['ko', 'en', 'ja', 'zh', 'vi', 'es', 'fr', 'hi', 'th', 'de', 'mn', 'ar', 'pt', 'tr'];
  return validCodes.includes(code.toLowerCase());
};

// 구독 상품 ID 검사
export const isValidProductId = (productId) => {
  const validProducts = ['talk', 'drama', 'test', 'journey'];
  return validProducts.includes(productId);
};

// 복합 검증 함수
export const validateUser = (userData) => {
  const errors = {};
  
  if (!isValidEmail(userData.email)) {
    errors.email = '유효한 이메일 주소를 입력해주세요';
  }
  
  if (!isValidPassword(userData.password)) {
    errors.password = '비밀번호는 최소 8자이며, 대문자, 소문자, 숫자를 포함해야 합니다';
  }
  
  if (userData.name && !isValidKoreanName(userData.name) && !isValidEnglishName(userData.name)) {
    errors.name = '유효한 이름을 입력해주세요';
  }
  
  if (userData.phoneNumber && !isValidPhoneNumber(userData.phoneNumber)) {
    errors.phoneNumber = '유효한 전화번호를 입력해주세요';
  }
  
  if (userData.koreanLevel && !isValidKoreanLevel(userData.koreanLevel)) {
    errors.koreanLevel = '유효한 한국어 레벨을 선택해주세요';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 구독 데이터 검증
export const validateSubscription = (subscriptionData) => {
  const errors = {};
  
  if (!isValidProductId(subscriptionData.productId)) {
    errors.productId = '유효한 상품을 선택해주세요';
  }
  
  if (subscriptionData.paymentMethod && !isValidCreditCard(subscriptionData.paymentMethod.cardNumber)) {
    errors.cardNumber = '유효한 신용카드 번호를 입력해주세요';
  }
  
  if (subscriptionData.paymentMethod && !isValidCVV(subscriptionData.paymentMethod.cvv)) {
    errors.cvv = '유효한 CVV를 입력해주세요';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 폼 필드 검증
export const validateField = (value, rules) => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message;
        }
        break;
        
      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          return rule.message;
        }
        break;
        
      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value) {
          return rule.message;
        }
        break;
        
      case 'pattern':
        if (typeof value === 'string' && !rule.value.test(value)) {
          return rule.message;
        }
        break;
        
      case 'email':
        if (!isValidEmail(value)) {
          return rule.message;
        }
        break;
        
      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }
  
  return null; // 모든 검증 통과
};

// 파일 크기 포맷팅 헬퍼 (formatting.js에서 가져오거나 단순 구현)
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};