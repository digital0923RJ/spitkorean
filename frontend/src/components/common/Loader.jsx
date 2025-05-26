import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

/**
 * 재사용 가능한 Loader 컴포넌트
 */
const Loader = ({
  size = 'md',
  color = 'primary',
  text,
  overlay = false,
  fullScreen = false,
  variant = 'spinner',
  className,
  textClassName,
  ...props
}) => {
  // 사이즈별 클래스
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  }
  
  // 색상별 클래스
  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }
  
  // 로더 variant들
  const LoaderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 
            className={clsx(
              'animate-spin',
              sizes[size],
              colors[color]
            )}
            {...props}
          />
        )
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-full animate-bounce',
                  size === 'xs' ? 'w-1 h-1' :
                  size === 'sm' ? 'w-1.5 h-1.5' :
                  size === 'md' ? 'w-2 h-2' :
                  size === 'lg' ? 'w-3 h-3' :
                  size === 'xl' ? 'w-4 h-4' : 'w-5 h-5',
                  colors[color].replace('text-', 'bg-')
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div className={clsx(
            'rounded-full animate-pulse',
            sizes[size],
            colors[color].replace('text-', 'bg-')
          )} />
        )
      
      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'animate-pulse',
                  size === 'xs' ? 'w-0.5 h-2' :
                  size === 'sm' ? 'w-0.5 h-3' :
                  size === 'md' ? 'w-1 h-4' :
                  size === 'lg' ? 'w-1 h-6' :
                  size === 'xl' ? 'w-1.5 h-8' : 'w-2 h-10',
                  colors[color].replace('text-', 'bg-')
                )}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )
      
      case 'ring':
        return (
          <div className={clsx(
            'border-4 border-gray-200 border-t-current rounded-full animate-spin',
            sizes[size],
            colors[color]
          )} />
        )
      
      case 'sparkles':
        return (
          <Sparkles 
            className={clsx(
              'animate-pulse',
              sizes[size],
              colors[color]
            )}
            {...props}
          />
        )
      
      default:
        return (
          <Loader2 
            className={clsx(
              'animate-spin',
              sizes[size],
              colors[color]
            )}
            {...props}
          />
        )
    }
  }
  
  // 기본 로더 컴포넌트
  const LoaderComponent = () => (
    <div className={clsx(
      'flex items-center justify-center',
      text && 'gap-3',
      className
    )}>
      <LoaderVariant />
      {text && (
        <span className={clsx(
          'text-sm font-medium',
          colors[color],
          textClassName
        )}>
          {text}
        </span>
      )}
    </div>
  )
  
  // 전체 화면 로더
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <LoaderComponent />
          {text && (
            <p className="text-gray-600 max-w-xs">{text}</p>
          )}
        </div>
      </div>
    )
  }
  
  // 오버레이 로더
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
          <LoaderComponent />
        </div>
      </div>
    )
  }
  
  return <LoaderComponent />
}

// 미리 정의된 로더 변형들
export const SpinnerLoader = (props) => <Loader variant="spinner" {...props} />
export const DotsLoader = (props) => <Loader variant="dots" {...props} />
export const PulseLoader = (props) => <Loader variant="pulse" {...props} />
export const BarsLoader = (props) => <Loader variant="bars" {...props} />
export const RingLoader = (props) => <Loader variant="ring" {...props} />
export const SparklesLoader = (props) => <Loader variant="sparkles" {...props} />

// 사이즈별 로더들
export const SmallLoader = (props) => <Loader size="sm" {...props} />
export const LargeLoader = (props) => <Loader size="lg" {...props} />
export const XLLoader = (props) => <Loader size="xl" {...props} />

// 컨테이너 로더들
export const OverlayLoader = (props) => <Loader overlay {...props} />
export const FullScreenLoader = (props) => <Loader fullScreen {...props} />

// 페이지 로딩 컴포넌트
export const PageLoader = ({ 
  text = "페이지를 불러오는 중...", 
  subtext,
  logo = true 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center space-y-6 max-w-md mx-4">
      {logo && (
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Loader size="lg" text={text} />
        {subtext && (
          <p className="text-sm text-gray-500">{subtext}</p>
        )}
      </div>
    </div>
  </div>
)

// 컴포넌트 로딩 래퍼
export const ComponentLoader = ({ 
  loading = true, 
  children, 
  text,
  height = 'auto',
  className 
}) => {
  if (!loading) return children
  
  return (
    <div className={clsx(
      'flex items-center justify-center py-8',
      height !== 'auto' && `h-${height}`,
      className
    )}>
      <Loader text={text} />
    </div>
  )
}

// 버튼 로더
export const ButtonLoader = ({ loading = false, children, ...props }) => {
  if (loading) {
    return <Loader size="sm" color="white" {...props} />
  }
  return children
}

// 인라인 로더
export const InlineLoader = ({ text, size = 'xs', ...props }) => (
  <span className="inline-flex items-center gap-1">
    <Loader size={size} {...props} />
    {text && <span className="text-sm">{text}</span>}
  </span>
)

// 스켈레톤 로더들
export const SkeletonLoader = ({ 
  lines = 3, 
  className,
  animate = true 
}) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }, (_, index) => (
      <div 
        key={index} 
        className={clsx(
          'h-4 bg-gray-200 rounded',
          animate && 'animate-pulse',
          index === lines - 1 ? 'w-2/3' : 'w-full'
        )}
      />
    ))}
  </div>
)

export const CardSkeletonLoader = ({ className, animate = true }) => (
  <div className={clsx(
    'bg-white rounded-lg border border-gray-200 p-4 space-y-4',
    animate && 'animate-pulse',
    className
  )}>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
)

export const ListSkeletonLoader = ({ 
  count = 5, 
  className,
  animate = true 
}) => (
  <div className={clsx('space-y-3', className)}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className={clsx(
        'flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200',
        animate && 'animate-pulse'
      )}>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
)

export const TableSkeletonLoader = ({ 
  rows = 5, 
  cols = 4, 
  className,
  animate = true 
}) => (
  <div className={clsx('space-y-2', className)}>
    {/* 헤더 */}
    <div className={clsx(
      'grid gap-4 p-3 bg-gray-50 rounded-lg',
      animate && 'animate-pulse'
    )} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }, (_, index) => (
        <div key={index} className="h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
    
    {/* 행들 */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className={clsx(
        'grid gap-4 p-3 bg-white border border-gray-200 rounded-lg',
        animate && 'animate-pulse'
      )} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }, (_, colIndex) => (
          <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
)

// SpitKorean 상품별 특화 로더들
export const TalkLoader = ({ message = "AI가 응답을 생성하고 있습니다..." }) => (
  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
      <span className="text-white text-sm font-medium">AI</span>
    </div>
    <div className="flex items-center space-x-2">
      <DotsLoader color="primary" />
      <span className="text-sm text-blue-700">{message}</span>
    </div>
  </div>
)

export const DramaLoader = ({ message = "문장을 분석하고 있습니다..." }) => (
  <div className="text-center py-6 space-y-3">
    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
      <span className="text-xl">🎬</span>
    </div>
    <BarsLoader color="secondary" size="lg" />
    <p className="text-sm text-purple-700">{message}</p>
  </div>
)

export const TestLoader = ({ message = "문제를 채점하고 있습니다..." }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-xl">📚</span>
      </div>
      <RingLoader color="success" size="lg" />
      <p className="text-sm text-green-700">{message}</p>
    </div>
  </div>
)

export const JourneyLoader = ({ message = "발음을 분석하고 있습니다..." }) => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-xl">🗺️</span>
      </div>
      <PulseLoader color="warning" size="lg" />
      <p className="text-sm text-orange-700">{message}</p>
      <div className="flex justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-6 bg-orange-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  </div>
)

// 특수한 상황의 로더들
export const AudioLoader = ({ isRecording = false, stage = 'idle' }) => {
  const stages = {
    idle: { color: 'gray', message: '준비 중...' },
    recording: { color: 'error', message: '녹음 중...' },
    processing: { color: 'primary', message: '음성 처리 중...' },
    analyzing: { color: 'success', message: '분석 중...' }
  }
  
  const currentStage = stages[stage] || stages.idle
  
  return (
    <div className="flex items-center space-x-3">
      <div className={clsx(
        'w-3 h-3 rounded-full',
        stage === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
      )} />
      <Loader size="sm" color={currentStage.color} />
      <span className="text-sm text-gray-600">{currentStage.message}</span>
    </div>
  )
}

export const ProgressLoader = ({ 
  progress = 0, 
  text = "처리 중...",
  showPercentage = true 
}) => (
  <div className="space-y-4 text-center">
    <Loader size="lg" />
    <div className="space-y-2">
      <p className="text-sm text-gray-600">{text}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-gray-500">{progress}%</span>
      )}
    </div>
  </div>
)

export const PaymentLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">💳</span>
        </div>
        <SpinnerLoader size="xl" color="success" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">결제 처리 중</h3>
          <p className="text-sm text-gray-600">
            잠시만 기다려주세요.<br />
            페이지를 새로고침하지 마세요.
          </p>
        </div>
      </div>
    </div>
  </div>
)

export const SearchLoader = ({ query, count = 0 }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <DotsLoader size="lg" color="primary" />
      <div className="space-y-1">
        <p className="text-gray-700 font-medium">
          "{query}"를 검색하고 있습니다...
        </p>
        {count > 0 && (
          <p className="text-sm text-gray-500">
            {count}개의 결과를 찾았습니다
          </p>
        )}
      </div>
    </div>
  </div>
)

export default Loader