import { clsx } from 'clsx'
import { ChevronRight, ExternalLink, MoreVertical, X } from 'lucide-react'
import TranslatableText, { T } from './TranslatableText'

/**
 * 번역 지원 재사용 가능한 Card 컴포넌트
 */
const Card = ({
  children,
  variant = 'default',
  size = 'md',
  padding = 'default',
  hover = false,
  clickable = false,
  selected = false,
  disabled = false,
  shadow = 'sm',
  rounded = 'lg',
  border = true,
  className,
  onClick,
  ...props
}) => {
  // variant별 스타일
  const variants = {
    default: 'bg-white',
    primary: 'bg-primary-50 border-primary-200',
    secondary: 'bg-secondary-50 border-secondary-200',
    success: 'bg-success-50 border-success-200',
    warning: 'bg-warning-50 border-warning-200',
    error: 'bg-error-50 border-error-200',
    info: 'bg-blue-50 border-blue-200',
    glass: 'bg-white bg-opacity-80 backdrop-blur-sm',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50'
  }

  // 그림자 스타일
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  // 모서리 둥글기
  const roundedOptions = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  }

  // 패딩 옵션
  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8'
  }

  // 기본 클래스 조합
  const cardClasses = clsx(
    'transition-all duration-200',
    variants[variant],
    shadows[shadow],
    roundedOptions[rounded],
    paddings[padding],
    border && variant === 'default' && 'border border-gray-200',
    border && variant !== 'default' && !variants[variant].includes('border-') && 'border',
    hover && 'hover:shadow-md hover:scale-[1.02]',
    clickable && 'cursor-pointer hover:shadow-lg',
    selected && 'ring-2 ring-primary-500 border-primary-300',
    disabled && 'opacity-50 pointer-events-none',
    className
  )

  const Component = clickable || onClick ? 'button' : 'div'

  return (
  <Component
    role={clickable || onClick ? 'button' : undefined}
    tabIndex={clickable || onClick ? 0 : undefined}
    className={cardClasses}
    onClick={onClick}
    onKeyDown={(e) => {
      if ((clickable || onClick) && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e);
      }
    }}
    {...props}
  >
    {children}
  </Component>
)
}

// 카드 헤더 컴포넌트
export const CardHeader = ({
  children,
  title,
  titleKey, // 번역할 제목 (한국어 원문)
  subtitle,
  subtitleKey, // 번역할 부제목 (한국어 원문)
  action,
  avatar,
  icon,
  className,
  ...props
}) => {
  return (
    <div className={clsx('flex items-center justify-between', className)} {...props}>
      <div className="flex items-center space-x-3">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        {icon && (
          <div className="flex-shrink-0 text-gray-500">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {(title || titleKey) && (
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {titleKey ? <T>{titleKey}</T> : title}
            </h3>
          )}
          {(subtitle || subtitleKey) && (
            <p className="text-sm text-gray-500 truncate">
              {subtitleKey ? <T>{subtitleKey}</T> : subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

// 카드 바디 컴포넌트
export const CardBody = ({ children, className, ...props }) => {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

// 카드 푸터 컴포넌트
export const CardFooter = ({
  children,
  align = 'right',
  className,
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div 
      className={clsx(
        'flex items-center pt-4 border-t border-gray-100',
        alignClasses[align],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

// 통계 카드
export const StatsCard = ({
  title,
  titleKey, // 번역할 제목
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  descriptionKey, // 번역할 설명
  trend,
  className,
  ...props
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <Card className={clsx('', className)} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">
            {titleKey ? <T>{titleKey}</T> : title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={clsx('text-sm mt-1', changeColors[changeType])}>
              {change}
            </p>
          )}
          {(description || descriptionKey) && (
            <p className="text-xs text-gray-500 mt-1">
              {descriptionKey ? <T>{descriptionKey}</T> : description}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
            <div className="w-6 h-6 text-primary-600">
              {icon}
            </div>
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4">
          <div className="flex items-center text-xs text-gray-500">
            <T>지난 30일</T>
          </div>
          <div className="mt-1 h-8">
            {trend}
          </div>
        </div>
      )}
    </Card>
  )
}

// 사용자 카드
export const UserCard = ({
  name,
  email,
  avatar,
  role,
  roleKey, // 번역할 역할
  status,
  statusKey, // 번역할 상태
  badges = [],
  actions,
  onClick,
  className,
  ...props
}) => {
  return (
    <Card 
      clickable={!!onClick}
      onClick={onClick}
      className={clsx('', className)} 
      {...props}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {avatar || (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </h3>
            {(status || statusKey) && (
              <span className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                status === 'active' ? 'bg-green-100 text-green-800' :
                status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              )}>
                {statusKey ? <T>{statusKey}</T> : status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{email}</p>
          {(role || roleKey) && (
            <p className="text-xs text-gray-400">
              {roleKey ? <T>{roleKey}</T> : role}
            </p>
          )}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <T>{badge}</T>
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </Card>
  )
}

// 제품 카드
export const ProductCard = ({
  name,
  nameKey, // 번역할 제품명
  description,
  descriptionKey, // 번역할 설명
  price,
  image,
  features = [],
  popular = false,
  popularText = "인기",
  popularTextKey = "인기",
  selectText = "선택",
  selectTextKey = "선택",
  detailText = "자세히",
  detailTextKey = "자세히",
  onSelect,
  onLearnMore,
  className,
  ...props
}) => {
  return (
    <Card 
      hover
      className={clsx(
        'relative overflow-hidden',
        popular && 'ring-2 ring-primary-500',
        className
      )} 
      {...props}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-xs font-semibold">
          {popularTextKey ? <T>{popularTextKey}</T> : popularText}
        </div>
      )}
      
      {image && (
        <div className="aspect-video bg-gray-100 mb-4 rounded-lg overflow-hidden">
          <img src={image} alt={nameKey ? nameKey : name} className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {nameKey ? <T>{nameKey}</T> : name}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {descriptionKey ? <T>{descriptionKey}</T> : description}
          </p>
        </div>
        
        {features.length > 0 && (
          <ul className="space-y-1">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <T>{feature}</T>
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-lg font-bold text-gray-900">{price}</div>
          <div className="flex space-x-2">
            {onLearnMore && (
              <button
                onClick={onLearnMore}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {detailTextKey ? <T>{detailTextKey}</T> : detailText}
              </button>
            )}
            {onSelect && (
              <button
                onClick={onSelect}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                {selectTextKey ? <T>{selectTextKey}</T> : selectText}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// 알림 카드
export const NotificationCard = ({
  title,
  titleKey, // 번역할 제목
  message,
  messageKey, // 번역할 메시지
  type = 'info',
  timestamp,
  read = false,
  readText = "읽음",
  readTextKey = "읽음",
  onMarkAsRead,
  onDismiss,
  className,
  ...props
}) => {
  const typeStyles = {
    info: 'border-l-4 border-blue-500 bg-blue-50',
    success: 'border-l-4 border-green-500 bg-green-50',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50',
    error: 'border-l-4 border-red-500 bg-red-50'
  }

  return (
    <Card 
      className={clsx(
        typeStyles[type],
        !read && 'shadow-md',
        read && 'opacity-75',
        className
      )}
      padding="default"
      {...props}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {titleKey ? <T>{titleKey}</T> : title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {messageKey ? <T>{messageKey}</T> : message}
          </p>
          {timestamp && (
            <p className="text-xs text-gray-500 mt-2">{timestamp}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {!read && onMarkAsRead && (
            <button
              onClick={onMarkAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {readTextKey ? <T>{readTextKey}</T> : readText}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

// 학습 진행 카드
export const ProgressCard = ({
  title,
  titleKey, // 번역할 제목
  subtitle,
  subtitleKey, // 번역할 부제목
  progress = 0,
  total,
  current,
  label,
  labelKey = "진행률", // 번역할 라벨
  continueText = "계속 학습하기",
  continueTextKey = "계속 학습하기",
  color = 'primary',
  icon,
  onContinue,
  className,
  ...props
}) => {
  const progressColors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  }

  return (
    <Card hover clickable={!!onContinue} onClick={onContinue} className={className} {...props}>
      <div className="space-y-4">
        <CardHeader
          title={title}
          titleKey={titleKey}
          subtitle={subtitle}
          subtitleKey={subtitleKey}
          icon={icon}
        />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {labelKey ? <T>{labelKey}</T> : label}
            </span>
            <span className="font-medium">
              {current && total ? `${current}/${total}` : `${progress}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={clsx('h-2 rounded-full transition-all duration-300', progressColors[color])}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {onContinue && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-500">
              {continueTextKey ? <T>{continueTextKey}</T> : continueText}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </Card>
  )
}

// 링크 카드
export const LinkCard = ({
  title,
  titleKey, // 번역할 제목
  description,
  descriptionKey, // 번역할 설명
  href,
  external = false,
  icon,
  image,
  badge,
  className,
  ...props
}) => {
  const Component = href ? 'a' : 'div'
  
  return (
    <Card 
      as={Component}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      hover
      clickable={!!href}
      className={clsx('relative', className)}
      {...props}
    >
      {badge && (
        <div className="absolute top-3 right-3">
          {badge}
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        {(icon || image) && (
          <div className="flex-shrink-0">
            {image ? (
              <img src={image} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900 truncate">
              {titleKey ? <T>{titleKey}</T> : title}
            </h3>
            {external && <ExternalLink className="w-4 h-4 text-gray-400" />}
          </div>
          {(description || descriptionKey) && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {descriptionKey ? <T>{descriptionKey}</T> : description}
            </p>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  )
}

// SpitKorean 전용 학습 카드
export const LearningCard = ({
  product,
  level,
  progress,
  lastActivity,
  lastActivityKey, // 번역할 마지막 활동 텍스트
  streakDays,
  continueText = "계속하기",
  continueTextKey = "계속하기",
  startText = "시작하기", 
  startTextKey = "시작하기",
  onStart,
  onContinue,
  className,
  ...props
}) => {
  const productIcons = {
    talk: '💬',
    drama: '🎬', 
    test: '📚',
    journey: '🗺️'
  }

  const productColors = {
    talk: 'blue',
    drama: 'purple',
    test: 'green', 
    journey: 'orange'
  }

  return (
    <Card 
      hover
      className={clsx('relative overflow-hidden', className)}
      {...props}
    >
      {streakDays > 0 && (
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
          <span>🔥</span>
          <span>{streakDays}<T>일</T></span>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-${productColors[product.id]}-100 rounded-lg flex items-center justify-center text-xl`}>
            {productIcons[product.id]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              <T>{product.nameKr}</T>
            </h3>
            <p className="text-sm text-gray-500">
              <T>{level}</T> <T>레벨</T>
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600"><T>진행률</T></span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-${productColors[product.id]}-600 transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            {(lastActivity || lastActivityKey) && (
              <p className="text-xs text-gray-500">
                <T>마지막 학습</T>: {lastActivityKey ? <T>{lastActivityKey}</T> : lastActivity}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {progress > 0 ? (
              <button
                onClick={onContinue}
                className={`px-4 py-2 bg-${productColors[product.id]}-600 text-white text-sm font-medium rounded-lg hover:bg-${productColors[product.id]}-700 transition-colors`}
              >
                {continueTextKey ? <T>{continueTextKey}</T> : continueText}
              </button>
            ) : (
              <button
                onClick={onStart}
                className={`px-4 py-2 bg-${productColors[product.id]}-600 text-white text-sm font-medium rounded-lg hover:bg-${productColors[product.id]}-700 transition-colors`}
              >
                {startTextKey ? <T>{startTextKey}</T> : startText}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Card