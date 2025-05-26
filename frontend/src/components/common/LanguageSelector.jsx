// frontend/src/components/common/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage.js';

/**
 * 언어 선택기 컴포넌트
 * SpitKorean의 14개 언어 지원을 위한 드롭다운 선택기
 */
const LanguageSelector = ({
  variant = 'default', // 'default', 'compact', 'button', 'minimal'
  position = 'bottom-left', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  showFlag = true,
  showName = true,
  showNativeName = false,
  className = '',
  disabled = false,
  placeholder = '언어 선택',
  onLanguageChange = null,
  ...props
}) => {
  const {
    currentLanguage,
    currentLanguageInfo,
    languageOptions,
    changeLanguage,
    isTranslating
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // 검색 필터링된 언어 목록
  const filteredLanguages = languageOptions.filter(lang =>
    lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 드롭다운 열릴 때 검색 입력에 포커스
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // 언어 선택 처리
  const handleLanguageSelect = (languageCode) => {
    const success = changeLanguage(languageCode);
    
    if (success) {
      setIsOpen(false);
      setSearchTerm('');
      
      // 콜백 실행
      if (onLanguageChange) {
        onLanguageChange(languageCode);
      }
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (event, languageCode = null) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (event.key === 'Enter' && languageCode) {
      handleLanguageSelect(languageCode);
    }
  };

  // 위치 클래스 매핑
  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1'
  };

  // 현재 언어 정보
  const currentLangInfo = currentLanguageInfo || languageOptions.find(lang => lang.value === currentLanguage);

  // 컴팩트 버전
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef} {...props}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || isTranslating}
          className={`
            flex items-center space-x-1 px-2 py-1 rounded-md text-sm
            border border-gray-300 bg-white hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled || isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          {showFlag && <span className="text-lg">{currentLangInfo?.flag}</span>}
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute ${positionClasses[position]} z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1`}>
            {filteredLanguages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageSelect(lang.value)}
                className={`
                  w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2
                  ${currentLanguage === lang.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLanguage === lang.value && (
                  <CheckIcon className="w-4 h-4 ml-auto text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 버튼 버전
  if (variant === 'button') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef} {...props}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || isTranslating}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
            bg-blue-600 text-white hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${disabled || isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            transition-colors duration-200
          `}
        >
          <GlobeAltIcon className="w-5 h-5" />
          {showFlag && <span className="text-lg">{currentLangInfo?.flag}</span>}
          {showName && <span>{currentLangInfo?.label || placeholder}</span>}
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute ${positionClasses[position]} z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2`}>
            {/* 검색 입력 */}
            <div className="px-3 pb-2">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="언어 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* 언어 목록 */}
            <div className="max-h-48 overflow-y-auto">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleLanguageSelect(lang.value)}
                    onKeyDown={(e) => handleKeyDown(e, lang.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3
                      ${currentLanguage === lang.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                      focus:outline-none focus:bg-gray-100
                    `}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{lang.label}</div>
                      {showNativeName && lang.nativeLabel && (
                        <div className="text-xs text-gray-500">{lang.nativeLabel}</div>
                      )}
                    </div>
                    {currentLanguage === lang.value && (
                      <CheckIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 최소 버전
  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef} {...props}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || isTranslating}
          className={`
            flex items-center space-x-1 text-gray-600 hover:text-gray-800
            ${disabled || isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={currentLangInfo?.label}
        >
          <span className="text-xl">{currentLangInfo?.flag}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className={`absolute ${positionClasses[position]} z-50 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1`}>
            {languageOptions.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageSelect(lang.value)}
                className={`
                  w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center space-x-2
                  ${currentLanguage === lang.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="truncate">{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 기본 버전 (default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef} {...props}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isTranslating}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-left
          border border-gray-300 rounded-lg bg-white hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled || isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          transition-colors duration-200
        `}
      >
        <div className="flex items-center space-x-3">
          {showFlag && <span className="text-2xl">{currentLangInfo?.flag}</span>}
          <div>
            {showName && (
              <div className="text-sm font-medium text-gray-900">
                {currentLangInfo?.label || placeholder}
              </div>
            )}
            {showNativeName && currentLangInfo?.nativeLabel && (
              <div className="text-xs text-gray-500">
                {currentLangInfo.nativeLabel}
              </div>
            )}
          </div>
        </div>
        
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className={`absolute ${positionClasses[position]} z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl py-2`}>
          {/* 검색 입력 */}
          <div className="px-4 pb-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="언어 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 언어 목록 */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageSelect(lang.value)}
                  onKeyDown={(e) => handleKeyDown(e, lang.value)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center space-x-3
                    ${currentLanguage === lang.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                    focus:outline-none focus:bg-gray-100
                    transition-colors duration-150
                  `}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{lang.label}</div>
                    {lang.nativeLabel && lang.nativeLabel !== lang.label && (
                      <div className="text-xs text-gray-500">{lang.nativeLabel}</div>
                    )}
                  </div>
                  {currentLanguage === lang.value && (
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                '{searchTerm}'에 대한 검색 결과가 없습니다
              </div>
            )}
          </div>
          
          {/* 하단 정보 */}
          {filteredLanguages.length > 0 && (
            <div className="px-4 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                {filteredLanguages.length}개 언어 표시
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 헤더용 컴팩트 언어 선택기
 */
export const HeaderLanguageSelector = (props) => (
  <LanguageSelector
    variant="compact"
    position="bottom-right"
    showFlag={true}
    showName={false}
    className="ml-4"
    {...props}
  />
);

/**
 * 설정 페이지용 풀 언어 선택기
 */
export const SettingsLanguageSelector = (props) => (
  <LanguageSelector
    variant="default"
    showFlag={true}
    showName={true}
    showNativeName={true}
    {...props}
  />
);

/**
 * 모바일용 버튼 언어 선택기
 */
export const MobileLanguageSelector = (props) => (
  <LanguageSelector
    variant="button"
    showFlag={true}
    showName={true}
    className="w-full"
    {...props}
  />
);

/**
 * 최소 언어 선택기 (아이콘만)
 */
export const MinimalLanguageSelector = (props) => (
  <LanguageSelector
    variant="minimal"
    position="bottom-right"
    {...props}
  />
);

export default LanguageSelector;