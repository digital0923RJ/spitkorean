import React from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import TranslatableText from './TranslatableText'

/**
 * 번역 지원 Button 컴포넌트
 */
const Button = React.forwardRef(({
  children,
  textKey, // 번역할 텍스트 (한국어 원문)
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // variant별 스타일 정의
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-300',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 disabled:bg-success-300',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 disabled:bg-warning-300',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 disabled:bg-error-300',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-primary-500 disabled:border-gray-200 disabled:text-gray-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 disabled:text-gray-400',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-primary-500 disabled:text-primary-300',
    gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 focus:ring-primary-500'
  }
  
  // size별 스타일 정의
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  }
  
  // 기본 클래스
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  // 최종 클래스 조합
  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  )
  
  // 로딩 또는 disabled 상태
  const isDisabled = disabled || loading
  
  // 클릭 핸들러
  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {/* 왼쪽 아이콘 또는 로딩 스피너 */}
      {loading ? (
        <Loader2 className={clsx(
          'animate-spin',
          size === 'xs' ? 'w-3 h-3' : 
          size === 'sm' ? 'w-4 h-4' :
          size === 'md' ? 'w-4 h-4' :
          size === 'lg' ? 'w-5 h-5' : 'w-5 h-5',
          (children || textKey) && (size === 'xs' ? 'mr-1' : 'mr-2')
        )} />
      ) : leftIcon ? (
        <span className={clsx(
          size === 'xs' ? 'w-3 h-3' : 
          size === 'sm' ? 'w-4 h-4' :
          size === 'md' ? 'w-4 h-4' :
          size === 'lg' ? 'w-5 h-5' : 'w-5 h-5',
          (children || textKey) && (size === 'xs' ? 'mr-1' : 'mr-2')
        )}>
          {leftIcon}
        </span>
      ) : null}
      
      {/* 버튼 텍스트 - 번역 지원 */}
      {(children || textKey) && (
        <span className={loading ? 'opacity-75' : ''}>
          {textKey ? (
            <TranslatableText>{textKey}</TranslatableText>
          ) : (
            children
          )}
        </span>
      )}
      
      {/* 오른쪽 아이콘 */}
      {rightIcon && !loading && (
        <span className={clsx(
          size === 'xs' ? 'w-3 h-3' : 
          size === 'sm' ? 'w-4 h-4' :
          size === 'md' ? 'w-4 h-4' :
          size === 'lg' ? 'w-5 h-5' : 'w-5 h-5',
          (children || textKey) && (size === 'xs' ? 'ml-1' : 'ml-2')
        )}>
          {rightIcon}
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

// 미리 정의된 버튼 변형들 (번역 지원)
export const PrimaryButton = (props) => <Button variant="primary" {...props} />
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />
export const SuccessButton = (props) => <Button variant="success" {...props} />
export const WarningButton = (props) => <Button variant="warning" {...props} />
export const ErrorButton = (props) => <Button variant="error" {...props} />
export const OutlineButton = (props) => <Button variant="outline" {...props} />
export const GhostButton = (props) => <Button variant="ghost" {...props} />
export const LinkButton = (props) => <Button variant="link" {...props} />
export const GradientButton = (props) => <Button variant="gradient" {...props} />

// 아이콘 전용 버튼
export const IconButton = ({ icon, size = 'md', className, ...props }) => {
  const iconSizes = {
    xs: 'w-6 h-6 p-1',
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
    xl: 'w-14 h-14 p-3'
  }
  
  return (
    <Button
      className={clsx(iconSizes[size], 'rounded-full', className)}
      {...props}
    >
      {icon}
    </Button>
  )
}

export default Button