// src/utils/validation.js
/**
 * SpitKorean 유효성 검사 유틸리티
 * 
 * 기능:
 * 1. 폼 입력값 검증
 * 2. 실시간 유효성 검사
 * 3. 다국어 에러 메시지
 * 4. 백엔드 API와 일치하는 검증 규칙
 * 5. 커스텀 검증 규칙
 */

import storage from './storage';

// 지원 언어 목록 (백엔드와 동일)
const SUPPORTED_LANGUAGES = {
  ko: '한국어',
  en: 'English', 
  ja: '日本語',
  zh: '中文',
  vi: 'Tiếng Việt',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  th: 'ไทย',
  de: 'Deutsch',
  mn: 'Монгол',
  ar: 'العربية',
  pt: 'Português',
  tr: 'Türkçe'
};

// 한국어 레벨 (백엔드와 동일)
const KOREAN_LEVELS = ['beginner', 'intermediate', 'advanced'];

// 상품 목록 (백엔드와 동일)
const PRODUCTS = ['talk', 'drama', 'test', 'journey'];

// 다국어 에러 메시지
const ERROR_MESSAGES = {
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters long',
    passwordStrength: 'Password must contain uppercase, lowercase, and numbers',
    passwordMatch: 'Passwords do not match',
    name: 'Name must be between 2 and 50 characters',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Must be no more than {max} characters',
    invalidOption: 'Please select a valid option',
    invalidLanguage: 'Please select a supported language',
    invalidLevel: 'Please select a valid Korean level',
    invalidProduct: 'Please select a valid product',
    phoneNumber: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    cardNumber: 'Please enter a valid card number',
    cvv: 'Please enter a valid CVV',
    expiryDate: 'Please enter a valid expiry date (MM/YY)',
    postalCode: 'Please enter a valid postal code',
    strongPassword: 'Use 8+ characters with uppercase, lowercase, numbers & symbols',
    weakPassword: 'Password is too weak',
    commonPassword: 'This password is too common',
    studyGoals: 'Please select at least one study goal',
    interests: 'Please select at least one interest',
    agreeTerms: 'You must agree to the terms and conditions',
    invalidFileType: 'Invalid file type. Please upload {types}',
    fileTooLarge: 'File size must be less than {size}MB'
  },
  ko: {
    required: '필수 입력 항목입니다',
    email: '올바른 이메일 주소를 입력해주세요',
    password: '비밀번호는 최소 8자 이상이어야 합니다',
    passwordStrength: '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
    passwordMatch: '비밀번호가 일치하지 않습니다',
    name: '이름은 2자 이상 50자 이하여야 합니다',
    minLength: '최소 {min}자 이상 입력해주세요',
    maxLength: '최대 {max}자까지 입력 가능합니다',
    invalidOption: '올바른 옵션을 선택해주세요',
    invalidLanguage: '지원하는 언어를 선택해주세요',
    invalidLevel: '올바른 한국어 레벨을 선택해주세요',
    invalidProduct: '올바른 상품을 선택해주세요',
    phoneNumber: '올바른 전화번호를 입력해주세요',
    url: '올바른 URL을 입력해주세요',
    cardNumber: '올바른 카드 번호를 입력해주세요',
    cvv: '올바른 CVV를 입력해주세요',
    expiryDate: '올바른 만료일을 입력해주세요 (MM/YY)',
    postalCode: '올바른 우편번호를 입력해주세요',
    strongPassword: '8자 이상, 대소문자, 숫자, 특수문자를 포함해주세요',
    weakPassword: '비밀번호가 너무 약합니다',
    commonPassword: '너무 흔한 비밀번호입니다',
    studyGoals: '최소 하나의 학습 목표를 선택해주세요',
    interests: '최소 하나의 관심사를 선택해주세요',
    agreeTerms: '이용약관에 동의해주세요',
    invalidFileType: '지원하지 않는 파일 형식입니다. {types} 파일을 업로드해주세요',
    fileTooLarge: '파일 크기는 {size}MB 이하여야 합니다'
  }
};

// 현재 언어 가져오기
const getCurrentLanguage = () => {
  return storage.user.getUILanguage() || 'en';
};

// 에러 메시지 가져오기
const getErrorMessage = (key, params = {}) => {
  const currentLang = getCurrentLanguage();
  const messages = ERROR_MESSAGES[currentLang] || ERROR_MESSAGES.en;
  let message = messages[key] || ERROR_MESSAGES.en[key] || key;
  
  // 파라미터 치환
  Object.keys(params).forEach(param => {
    message = message.replace(`{${param}}`, params[param]);
  });
  
  return message;
};

/**
 * 기본 검증 함수들
 */
export const validators = {
  // 필수 입력 검증
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value === true;
    return !!value;
  },

  // 이메일 검증
  email: (value) => {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // 비밀번호 길이 검증
  password: (value) => {
    if (!value) return false;
    return value.length >= 8;
  },

  // 비밀번호 강도 검증
  passwordStrength: (value) => {
    if (!value) return false;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    return hasUpperCase && hasLowerCase && hasNumbers;
  },

  // 강한 비밀번호 검증 (특수문자 포함)
  strongPassword: (value) => {
    if (!value) return false;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(value);
    return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },

  // 비밀번호 일치 검증
  passwordMatch: (value, compareValue) => {
    return value === compareValue;
  },

  // 이름 검증
  name: (value) => {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  },

  // 최소 길이 검증
  minLength: (value, min) => {
    if (!value) return false;
    return value.length >= min;
  },

  // 최대 길이 검증
  maxLength: (value, max) => {
    if (!value) return true; // 빈 값은 허용
    return value.length <= max;
  },

  // 언어 코드 검증
  language: (value) => {
    return SUPPORTED_LANGUAGES.hasOwnProperty(value);
  },

  // 한국어 레벨 검증
  koreanLevel: (value) => {
    return KOREAN_LEVELS.includes(value);
  },

  // 상품 검증
  product: (value) => {
    return PRODUCTS.includes(value);
  },

  // 전화번호 검증 (국제 형식)
  phoneNumber: (value) => {
    if (!value) return false;
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const digitsOnly = value.replace(/\D/g, '');
    return phoneRegex.test(value) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
  },

  // URL 검증
  url: (value) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // 카드 번호 검증 (Luhn 알고리즘)
  cardNumber: (value) => {
    if (!value) return false;
    const cleaned = value.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    // Luhn 알고리즘
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // CVV 검증
  cvv: (value) => {
    if (!value) return false;
    return /^\d{3,4}$/.test(value);
  },

  // 만료일 검증 (MM/YY)
  expiryDate: (value) => {
    if (!value) return false;
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    
    const [month, year] = value.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    
    return true;
  },

  // 우편번호 검증
  postalCode: (value, country = 'US') => {
    if (!value) return false;
    
    const patterns = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
      KR: /^\d{5}$/,
      JP: /^\d{3}-\d{4}$/
    };
    
    const pattern = patterns[country] || patterns.US;
    return pattern.test(value);
  },

  // 파일 타입 검증
  fileType: (file, allowedTypes) => {
    if (!file) return false;
    return allowedTypes.includes(file.type);
  },

  // 파일 크기 검증 (MB)
  fileSize: (file, maxSizeMB) => {
    if (!file) return false;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // 숫자 범위 검증
  numberRange: (value, min, max) => {
    const num = Number(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  },

  // 배열 최소 길이 검증
  arrayMinLength: (array, min) => {
    return Array.isArray(array) && array.length >= min;
  }
};

/**
 * 비밀번호 강도 계산기
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: '', color: 'gray', feedback: [] };

  let score = 0;
  const feedback = [];

  // 길이 체크
  if (password.length >= 8) score += 1;
  else feedback.push(getErrorMessage('minLength', { min: 8 }));

  // 대문자 체크
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('대문자 포함');

  // 소문자 체크
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('소문자 포함');

  // 숫자 체크
  if (/\d/.test(password)) score += 1;
  else feedback.push('숫자 포함');

  // 특수문자 체크
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;
  else feedback.push('특수문자 포함');

  // 점수에 따른 강도 판정
  const strengthLevels = [
    { score: 0, text: '매우 약함', color: 'red' },
    { score: 1, text: '약함', color: 'red' },
    { score: 2, text: '보통', color: 'yellow' },
    { score: 3, text: '좋음', color: 'blue' },
    { score: 4, text: '강함', color: 'green' },
    { score: 5, text: '매우 강함', color: 'green' }
  ];

  const strength = strengthLevels[Math.min(score, 5)];

  return {
    score,
    text: strength.text,
    color: strength.color,
    feedback,
    percentage: (score / 5) * 100
  };
};

/**
 * 검증 규칙 클래스
 */
export class ValidationRule {
  constructor(validator, message, params = {}) {
    this.validator = validator;
    this.message = message;
    this.params = params;
  }

  validate(value, allValues = {}) {
    const isValid = typeof this.validator === 'function' 
      ? this.validator(value, allValues)
      : validators[this.validator](value, ...Object.values(this.params));
    
    return {
      isValid,
      message: isValid ? null : getErrorMessage(this.message, this.params)
    };
  }
}
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePassword = (password) => {
  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
  return {
    isValid,
    message: isValid
      ? ''
      : 'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula e número.'
  }
}

export const validateName = (name) => {
  return name?.length >= 2 && name?.length <= 50
}


/**
 * 폼 검증기 클래스
 */
export class FormValidator {
  constructor(rules = {}) {
    this.rules = rules;
    this.errors = {};
  }

  // 규칙 추가
  addRule(field, rule) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(rule);
    return this;
  }

  // 단일 필드 검증
  validateField(field, value, allValues = {}) {
    const fieldRules = this.rules[field] || [];
    const errors = [];

    for (const rule of fieldRules) {
      const result = rule.validate(value, allValues);
      if (!result.isValid) {
        errors.push(result.message);
      }
    }

    this.errors[field] = errors.length > 0 ? errors[0] : null; // 첫 번째 에러만 표시
    return this.errors[field] === null;
  }

  // 전체 폼 검증
  validateForm(values) {
    let isValid = true;
    const errors = {};

    Object.keys(this.rules).forEach(field => {
      const fieldValid = this.validateField(field, values[field], values);
      if (!fieldValid) {
        isValid = false;
        errors[field] = this.errors[field];
      }
    });

    this.errors = errors;
    return { isValid, errors };
  }

  // 에러 클리어
  clearErrors(field = null) {
    if (field) {
      delete this.errors[field];
    } else {
      this.errors = {};
    }
  }

  // 특정 필드 에러 가져오기
  getFieldError(field) {
    return this.errors[field] || null;
  }

  // 모든 에러 가져오기
  getAllErrors() {
    return this.errors;
  }

  // 유효성 여부 확인
  isFieldValid(field) {
    return !this.errors[field];
  }

  // 전체 폼 유효성 여부
  isFormValid() {
    return Object.keys(this.errors).length === 0;
  }
}

/**
 * 실시간 검증 훅 (React Hook과 함께 사용)
 */
export const createValidator = (initialRules = {}) => {
  const validator = new FormValidator(initialRules);

  return {
    validator,
    validateField: validator.validateField.bind(validator),
    validateForm: validator.validateForm.bind(validator),
    getFieldError: validator.getFieldError.bind(validator),
    getAllErrors: validator.getAllErrors.bind(validator),
    clearErrors: validator.clearErrors.bind(validator),
    isFieldValid: validator.isFieldValid.bind(validator),
    isFormValid: validator.isFormValid.bind(validator),
    addRule: validator.addRule.bind(validator)
  };
};

/**
 * 미리 정의된 폼 검증기들
 */
export const formValidators = {
  // 로그인 폼
  login: () => {
    const validator = new FormValidator();
    validator.addRule('email', new ValidationRule('required', 'required'));
    validator.addRule('email', new ValidationRule('email', 'email'));
    validator.addRule('password', new ValidationRule('required', 'required'));
    validator.addRule('password', new ValidationRule('password', 'password'));
    return validator;
  },

  // 회원가입 폼
  register: () => {
    const validator = new FormValidator();
    
    // 이름
    validator.addRule('name', new ValidationRule('required', 'required'));
    validator.addRule('name', new ValidationRule('name', 'name'));
    
    // 이메일
    validator.addRule('email', new ValidationRule('required', 'required'));
    validator.addRule('email', new ValidationRule('email', 'email'));
    
    // 비밀번호
    validator.addRule('password', new ValidationRule('required', 'required'));
    validator.addRule('password', new ValidationRule('password', 'password'));
    validator.addRule('password', new ValidationRule('passwordStrength', 'passwordStrength'));
    
    // 비밀번호 확인
    validator.addRule('confirmPassword', new ValidationRule('required', 'required'));
    validator.addRule('confirmPassword', new ValidationRule((value, allValues) => {
      return validators.passwordMatch(value, allValues.password);
    }, 'passwordMatch'));
    
    // 모국어
    validator.addRule('nativeLanguage', new ValidationRule('required', 'required'));
    validator.addRule('nativeLanguage', new ValidationRule('language', 'invalidLanguage'));
    
    // 한국어 레벨
    validator.addRule('koreanLevel', new ValidationRule('required', 'required'));
    validator.addRule('koreanLevel', new ValidationRule('koreanLevel', 'invalidLevel'));
    
    // 학습 목표
    validator.addRule('studyGoals', new ValidationRule((value) => {
      return validators.arrayMinLength(value, 1);
    }, 'studyGoals'));
    
    // 약관 동의
    validator.addRule('agreeToTerms', new ValidationRule('required', 'agreeTerms'));
    
    return validator;
  },

  // 프로필 수정 폼
  profile: () => {
    const validator = new FormValidator();
    validator.addRule('name', new ValidationRule('required', 'required'));
    validator.addRule('name', new ValidationRule('name', 'name'));
    validator.addRule('email', new ValidationRule('required', 'required'));
    validator.addRule('email', new ValidationRule('email', 'email'));
    validator.addRule('nativeLanguage', new ValidationRule('language', 'invalidLanguage'));
    validator.addRule('koreanLevel', new ValidationRule('koreanLevel', 'invalidLevel'));
    return validator;
  },

  // 결제 폼
  payment: () => {
    const validator = new FormValidator();
    
    // 카드 정보
    validator.addRule('cardNumber', new ValidationRule('required', 'required'));
    validator.addRule('cardNumber', new ValidationRule('cardNumber', 'cardNumber'));
    
    validator.addRule('expiryDate', new ValidationRule('required', 'required'));
    validator.addRule('expiryDate', new ValidationRule('expiryDate', 'expiryDate'));
    
    validator.addRule('cvv', new ValidationRule('required', 'required'));
    validator.addRule('cvv', new ValidationRule('cvv', 'cvv'));
    
    validator.addRule('cardName', new ValidationRule('required', 'required'));
    validator.addRule('cardName', new ValidationRule('minLength', 'minLength', { min: 2 }));
    
    // 연락처 정보
    validator.addRule('email', new ValidationRule('required', 'required'));
    validator.addRule('email', new ValidationRule('email', 'email'));
    
    return validator;
  }
};

/**
 * 유틸리티 함수들
 */
export const validationUtils = {
  // 카드 번호 포맷팅
  formatCardNumber: (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // 16자리 + 3개 공백
  },

  // 만료일 포맷팅
  formatExpiryDate: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{2})/, '$1/');
    return formatted.substring(0, 5);
  },

  // 전화번호 포맷팅
  formatPhoneNumber: (value, country = 'US') => {
    const cleaned = value.replace(/\D/g, '');
    
    switch (country) {
      case 'US':
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      case 'KR':
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
      default:
        return value;
    }
  },

  // 실시간 검증 디바운스
  debounceValidation: (validator, delay = 300) => {
    let timeoutId;
    
    return (field, value, allValues) => {
      clearTimeout(timeoutId);
      
      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          const isValid = validator.validateField(field, value, allValues);
          resolve({
            isValid,
            error: validator.getFieldError(field)
          });
        }, delay);
      });
    };
  },

  // 서버 에러와 매핑
  mapServerErrors: (serverErrors, fieldMapping = {}) => {
    const mappedErrors = {};
    
    Object.keys(serverErrors).forEach(serverField => {
      const clientField = fieldMapping[serverField] || serverField;
      mappedErrors[clientField] = serverErrors[serverField];
    });
    
    return mappedErrors;
  },

  // 백엔드 검증 에러 처리
  handleBackendValidationErrors: (error) => {
    if (error.response && error.response.data && error.response.data.errors) {
      return error.response.data.errors;
    }
    
    // 일반적인 백엔드 에러 메시지
    if (error.response && error.response.data && error.response.data.message) {
      return { general: error.response.data.message };
    }
    
    return { general: getErrorMessage('required') }; // 기본 에러 메시지
  }
};

export { getErrorMessage }

// 기본 내보내기
export default {
  validators,
  ValidationRule,
  validateEmail,
  validatePassword,
  FormValidator,
  createValidator,
  formValidators,
  validationUtils,
  getPasswordStrength,
  getErrorMessage,
  ERROR_MESSAGES,
  SUPPORTED_LANGUAGES,
  KOREAN_LEVELS,
  PRODUCTS
};

