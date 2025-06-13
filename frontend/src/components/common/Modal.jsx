import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import Button from './Buttom'
import TranslatableText, { T } from './TranslatableText'

/**
 * 번역 지원 재사용 가능한 Modal 컴포넌트
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  titleKey, // 번역할 제목 (한국어 원문)
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
  overlayClassName,
  contentClassName,
  preventScroll = true,
  ...props
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  // 사이즈별 클래스
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full mx-4'
  }

  // variant별 스타일
  const variants = {
    default: {
      header: 'border-b border-gray-200',
      icon: null,
      iconColor: ''
    },
    success: {
      header: 'border-b border-green-200 bg-green-50',
      icon: <CheckCircle className="w-6 h-6" />,
      iconColor: 'text-green-600'
    },
    warning: {
      header: 'border-b border-yellow-200 bg-yellow-50',
      icon: <AlertTriangle className="w-6 h-6" />,
      iconColor: 'text-yellow-600'
    },
    error: {
      header: 'border-b border-red-200 bg-red-50',
      icon: <AlertCircle className="w-6 h-6" />,
      iconColor: 'text-red-600'
    },
    info: {
      header: 'border-b border-blue-200 bg-blue-50',
      icon: <Info className="w-6 h-6" />,
      iconColor: 'text-blue-600'
    }
  }

  const variantConfig = variants[variant] || variants.default

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 포커스 트랩
      previousActiveElement.current = document.activeElement
      modalRef.current?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, closeOnEscape, onClose])

  // 스크롤 방지
  useEffect(() => {
    if (isOpen && preventScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen, preventScroll])

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose()
    }
  }

  // 포커스 트랩 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements?.length) {
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 모달 컨텐츠 */}
      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative bg-white rounded-lg shadow-xl transform transition-all',
          'w-full',
          sizes[size],
          className
        )}
        {...props}
      >
        {/* 헤더 */}
        {((title || titleKey) || showCloseButton) && (
          <div className={clsx('flex items-center justify-between p-6', variantConfig.header)}>
            <div className="flex items-center space-x-3">
              {variantConfig.icon && (
                <div className={variantConfig.iconColor}>
                  {variantConfig.icon}
                </div>
              )}
              {(title || titleKey) && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {titleKey ? <T>{titleKey}</T> : title}
                </h3>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
                aria-label="모달 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* 컨텐츠 */}
        <div className={clsx('px-6', !footer && 'pb-6', contentClassName)}>
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// 확인 모달
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  titleKey = "확인",
  message,
  messageKey, // 번역할 메시지 (한국어 원문)
  confirmText,
  confirmTextKey = "확인",
  cancelText,
  cancelTextKey = "취소",
  variant = "warning",
  loading = false,
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleKey={!title ? titleKey : undefined}
      variant={variant}
      size="sm"
      footer={
        <div className="flex space-x-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            textKey={!cancelText ? cancelTextKey : undefined}
          >
            {cancelText || <T>{cancelTextKey}</T>}
          </Button>
          <Button
            variant={variant === 'error' ? 'error' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
            textKey={!confirmText ? confirmTextKey : undefined}
          >
            {confirmText || <T>{confirmTextKey}</T>}
          </Button>
        </div>
      }
      {...props}
    >
      <p className="text-gray-600">
        {messageKey ? <T>{messageKey}</T> : message}
      </p>
    </Modal>
  )
}

// 알림 모달
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  titleKey,
  message,
  messageKey,
  buttonText,
  buttonTextKey = "확인",
  variant = "info",
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleKey={titleKey}
      variant={variant}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onClose}
            textKey={!buttonText ? buttonTextKey : undefined}
          >
            {buttonText || <T>{buttonTextKey}</T>}
          </Button>
        </div>
      }
      {...props}
    >
      <p className="text-gray-600">
        {messageKey ? <T>{messageKey}</T> : message}
      </p>
    </Modal>
  )
}

// 로딩 모달
export const LoadingModal = ({
  isOpen,
  title,
  titleKey = "처리 중...",
  message,
  messageKey = "잠시만 기다려주세요.",
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      titleKey={!title ? titleKey : undefined}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      {...props}
    >
      <div className="flex items-center space-x-3 py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <p className="text-gray-600">
          {messageKey ? <T>{messageKey}</T> : message}
        </p>
      </div>
    </Modal>
  )
}

// 폼 모달
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  titleKey,
  children,
  submitText,
  submitTextKey = "저장",
  cancelText,
  cancelTextKey = "취소",
  loading = false,
  canSubmit = true,
  ...props
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onSubmit && canSubmit) {
      await onSubmit()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleKey={titleKey}
      footer={
        <div className="flex space-x-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            textKey={!cancelText ? cancelTextKey : undefined}
          >
            {cancelText || <T>{cancelTextKey}</T>}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
            textKey={!submitText ? submitTextKey : undefined}
          >
            {submitText || <T>{submitTextKey}</T>}
          </Button>
        </div>
      }
      {...props}
    >
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  )
}

// 이미지 갤러리 모달
export const ImageModal = ({
  isOpen,
  onClose,
  src,
  alt,
  title,
  titleKey,
  description,
  descriptionKey,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleKey={titleKey}
      size="4xl"
      {...props}
    >
      <div className="text-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-96 mx-auto rounded-lg"
        />
        {(description || descriptionKey) && (
          <p className="mt-4 text-gray-600">
            {descriptionKey ? <T>{descriptionKey}</T> : description}
          </p>
        )}
      </div>
    </Modal>
  )
}

// 비디오 모달
export const VideoModal = ({
  isOpen,
  onClose,
  src,
  title,
  titleKey,
  autoPlay = false,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleKey={titleKey}
      size="4xl"
      {...props}
    >
      <div className="aspect-video">
        <video
          src={src}
          controls
          autoPlay={autoPlay}
          className="w-full h-full rounded-lg"
        />
      </div>
    </Modal>
  )
}

// SpitKorean 상품별 특화 모달들
export const SubscriptionModal = ({ isOpen, onClose, plan, ...props }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleKey={`${plan?.name} 구독하기`}
      variant="success"
      size="lg"
      {...props}
    >
      <div className="space-y-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <h4 className="font-semibold text-primary-900 mb-2">
            <T>포함된 기능</T>
          </h4>
          <ul className="space-y-1 text-sm text-primary-800">
            {plan?.features?.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <T>{feature}</T>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-gray-900">
            ${plan?.price}
            <span className="text-lg text-gray-500">/<T>월</T></span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            <T>7일 무료 체험 포함</T>
          </p>
        </div>
      </div>
    </Modal>
  )
}

export const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  feedback, 
  onRetry,
  type = 'general',
  ...props 
}) => {
  const getVariant = () => {
    if (feedback?.score >= 80) return 'success'
    if (feedback?.score >= 60) return 'warning'
    return 'error'
  }

  const getScoreMessage = (score) => {
    if (score >= 80) return '훌륭해요!'
    if (score >= 60) return '좋아요!'
    return '조금 더 연습해보세요'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleKey="학습 피드백"
      variant={getVariant()}
      size="lg"
      footer={
        <div className="flex space-x-3 justify-end">
          {onRetry && (
            <Button variant="outline" onClick={onRetry} textKey="다시 시도" />
          )}
          <Button variant="primary" onClick={onClose} textKey="확인" />
        </div>
      }
      {...props}
    >
      <div className="space-y-4">
        {feedback?.score !== undefined && (
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {feedback.score}<T>점</T>
            </div>
            <div className="text-sm text-gray-600">
              <T>{getScoreMessage(feedback.score)}</T>
            </div>
          </div>
        )}
        
        {feedback?.explanation && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              <T>상세 설명</T>
            </h4>
            <p className="text-gray-700 text-sm">
              <T>{feedback.explanation}</T>
            </p>
          </div>
        )}
        
        {feedback?.suggestions?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              <T>개선 제안</T>
            </h4>
            <ul className="space-y-1">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span><T>{suggestion}</T></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default Modal