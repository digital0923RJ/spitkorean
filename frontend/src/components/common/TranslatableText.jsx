// frontend/src/components/common/TranslatableText.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

/**
 * 자동 번역 텍스트 컴포넌트
 * 사용자의 언어 설정에 따라 실시간으로 번역
 * 
 * @param {string} children - 번역할 텍스트
 * @param {string} className - CSS 클래스
 * @param {string} fallback - 텍스트가 없을 때 표시할 기본값
 * @param {string} as - 렌더링할 HTML 태그 (기본값: span)
 * @param {string} context - 번역 컨텍스트 (general, ui, feedback)
 * @param {boolean} cached - 캐시 사용 여부 (기본값: true)
 * @param {function} onTranslated - 번역 완료 콜백
 * @param {object} ...props - 기타 HTML 속성
 */
const TranslatableText = ({ 
  children, 
  className = '', 
  fallback = '',
  as: Component = 'span',
  context = 'general',
  cached = true,
  onTranslated,
  ...props 
}) => {
  const { 
    currentLanguage, 
    translate, 
    translateUIText,
    isTranslating: globalIsTranslating 
  } = useLanguage();
  
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  // 원본 텍스트 추출
  const originalText = useMemo(() => {
    return children || fallback || '';
  }, [children, fallback]);

  // 번역 실행
  useEffect(() => {
    const translateContent = async () => {
      // 텍스트가 없거나 한국어인 경우 번역하지 않음
      if (!originalText.trim() || currentLanguage === 'ko') {
        setTranslatedText(originalText);
        setError(null);
        return;
      }

      try {
        setIsTranslating(true);
        setError(null);
        
        let translated;
        
        switch (context) {
          case 'ui':
            // UI 텍스트는 별도 번역 서비스 사용
            translated = await translateUIText({ text: originalText });
            translated = translated?.text || originalText;
            break;
            
          case 'feedback':
            // 학습 피드백은 OpenAI 사용 (useLanguage에서 처리)
            translated = await translate(originalText, currentLanguage, 'ko');
            break;
            
          case 'general':
          default:
            // 일반 텍스트는 Google Translate 사용
            translated = await translate(originalText, currentLanguage, 'ko');
            break;
        }
        
        setTranslatedText(translated);
        
        // 번역 완료 콜백 실행
        if (onTranslated) {
          onTranslated(translated, originalText);
        }
        
      } catch (err) {
        console.error('번역 오류:', err);
        setError(err.message || '번역에 실패했습니다.');
        setTranslatedText(originalText); // 실패 시 원문 표시
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [originalText, currentLanguage, context, translate, translateUIText, onTranslated]);

  // 로딩 상태 클래스
  const loadingClass = (isTranslating || globalIsTranslating) ? 'opacity-75 animate-pulse' : '';
  
  // 에러 상태 클래스
  const errorClass = error ? 'text-red-500' : '';

  return (
    <Component 
      className={`${className} ${loadingClass} ${errorClass}`.trim()}
      title={error ? `번역 오류: ${error}` : undefined}
      {...props}
    >
      {translatedText || originalText}
    </Component>
  );
};

/**
 * 인라인 번역 컴포넌트 (짧은 텍스트용)
 * 사용법: <T>안녕하세요</T>
 */
export const T = ({ children, ...props }) => (
  <TranslatableText as="span" {...props}>
    {children}
  </TranslatableText>
);

/**
 * UI 텍스트 번역 컴포넌트 (버튼, 메뉴 등)
 * 사용법: <TUI>저장</TUI>
 */
export const TUI = ({ children, ...props }) => (
  <TranslatableText as="span" context="ui" {...props}>
    {children}
  </TranslatableText>
);

/**
 * 학습 피드백 번역 컴포넌트
 * 사용법: <TFeedback>문법이 틀렸습니다</TFeedback>
 */
export const TFeedback = ({ children, ...props }) => (
  <TranslatableText as="div" context="feedback" {...props}>
    {children}
  </TranslatableText>
);

/**
 * 블록 레벨 번역 컴포넌트 (긴 텍스트용)
 * 사용법: <TBlock as="p">긴 설명 텍스트...</TBlock>
 */
export const TBlock = ({ children, as = "div", ...props }) => (
  <TranslatableText as={as} {...props}>
    {children}
  </TranslatableText>
);

/**
 * 조건부 번역 컴포넌트
 * 특정 조건에서만 번역을 실행
 */
export const TConditional = ({ 
  children, 
  condition = true, 
  fallbackText = '',
  ...props 
}) => {
  if (!condition) {
    return fallbackText || children;
  }
  
  return (
    <TranslatableText {...props}>
      {children}
    </TranslatableText>
  );
};

/**
 * 지연 번역 컴포넌트
 * 사용자가 hover하거나 focus할 때만 번역
 */
export const TLazy = ({ 
  children, 
  trigger = 'hover', // 'hover', 'focus', 'click'
  ...props 
}) => {
  const [shouldTranslate, setShouldTranslate] = useState(false);
  
  const handleTrigger = () => {
    if (!shouldTranslate) {
      setShouldTranslate(true);
    }
  };
  
  const triggerProps = {
    [trigger === 'hover' ? 'onMouseEnter' : trigger === 'focus' ? 'onFocus' : 'onClick']: handleTrigger
  };
  
  if (!shouldTranslate) {
    return (
      <span {...triggerProps} className="cursor-pointer" {...props}>
        {children}
      </span>
    );
  }
  
  return (
    <TranslatableText {...props}>
      {children}
    </TranslatableText>
  );
};

export default TranslatableText;