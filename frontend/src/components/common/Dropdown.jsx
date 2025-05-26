import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { clsx } from 'clsx'

/**
 * 재사용 가능한 Dropdown 컴포넌트
 */
const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "선택하세요",
  label,
  error,
  success,
  helperText,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'md',
  fullWidth = true,
  maxHeight = 'max-h-60',
  className,
  containerClassName,
  labelClassName,
  optionRenderer,
  valueRenderer,
  groupBy,
  loading = false,
  emptyMessage = "옵션이 없습니다",
  searchPlaceholder = "검색...",
  id,
  name,
  required = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const optionsRef = useRef(null)
  
  // 고유 ID 생성
  const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`
  
  // 사이즈별 클래스
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  // 옵션 필터링
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // 그룹별 옵션 정리
  const groupedOptions = groupBy
    ? filteredOptions.reduce((groups, option) => {
        const group = option[groupBy] || '기타'
        if (!groups[group]) groups[group] = []
        groups[group].push(option)
        return groups
      }, {})
    : { all: filteredOptions }

  // 선택된 값들
  const selectedValues = multiple
    ? Array.isArray(value) ? value : (value ? [value] : [])
    : value ? [value] : []

  // 상태별 클래스
  const getTriggerClasses = () => {
    const baseClasses = 'relative w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer'
    
    let stateClasses = ''
    if (error) {
      stateClasses = 'border-error-300 focus:border-error-500 focus:ring-error-500'
    } else if (success) {
      stateClasses = 'border-success-300 focus:border-success-500 focus:ring-success-500'
    } else if (isOpen) {
      stateClasses = 'border-primary-300 focus:border-primary-500 focus:ring-primary-500'
    } else {
      stateClasses = 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
    }
    
    const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
    
    return clsx(
      baseClasses,
      sizes[size],
      stateClasses,
      disabledClasses,
      className
    )
  }

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          setIsOpen(false)
          setSearchQuery('')
          setHighlightedIndex(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, filteredOptions])

  // 검색 입력 포커스
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // 옵션 선택 핸들러
  const handleOptionSelect = (option) => {
    if (disabled || option.disabled) return

    if (multiple) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value]
      onChange?.(newValue)
    } else {
      onChange?.(option.value)
      setIsOpen(false)
      setSearchQuery('')
    }
    setHighlightedIndex(-1)
  }

  // 값 제거 핸들러
  const handleRemoveValue = (valueToRemove, event) => {
    event.stopPropagation()
    if (multiple) {
      const newValue = selectedValues.filter(v => v !== valueToRemove)
      onChange?.(newValue)
    } else if (clearable) {
      onChange?.(null)
    }
  }

  // 전체 지우기
  const handleClearAll = (event) => {
    event.stopPropagation()
    onChange?.(multiple ? [] : null)
  }

  // 선택된 옵션 가져오기
  const getSelectedOption = (val) => {
    return options.find(option => option.value === val)
  }

  // 값 렌더링
  const renderValue = () => {
    if (selectedValues.length === 0) {
      return <span className="text-gray-400">{placeholder}</span>
    }

    if (multiple) {
      if (selectedValues.length === 1) {
        const option = getSelectedOption(selectedValues[0])
        return valueRenderer ? valueRenderer(option) : option?.label || selectedValues[0]
      }
      return `${selectedValues.length}개 선택됨`
    }

    const option = getSelectedOption(selectedValues[0])
    return valueRenderer ? valueRenderer(option) : option?.label || selectedValues[0]
  }

  // 옵션 렌더링
  const renderOption = (option, index) => {
    const isSelected = selectedValues.includes(option.value)
    const isHighlighted = index === highlightedIndex

    return (
      <div
        key={option.value}
        className={clsx(
          'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
          isHighlighted && 'bg-primary-50',
          isSelected && 'bg-primary-100',
          option.disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleOptionSelect(option)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        <div className="flex items-center space-x-2">
          {optionRenderer ? optionRenderer(option) : (
            <>
              {option.icon && <span className="w-4 h-4">{option.icon}</span>}
              <span className={clsx(
                option.disabled ? 'text-gray-400' : 'text-gray-900'
              )}>
                {option.label}
              </span>
            </>
          )}
        </div>
        {isSelected && <Check className="w-4 h-4 text-primary-600" />}
      </div>
    )
  }

  return (
    <div className={clsx(fullWidth ? 'w-full' : '', containerClassName)}>
      {/* 라벨 */}
      {label && (
        <label 
          htmlFor={dropdownId}
          className={clsx(
            'block text-sm font-medium text-gray-700 mb-1',
            required && "after:content-['*'] after:text-error-500 after:ml-1",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      {/* 드롭다운 컨테이너 */}
      <div ref={dropdownRef} className="relative">
        {/* 트리거 */}
        <div
          id={dropdownId}
          name={name}
          className={getTriggerClasses()}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={disabled ? -1 : 0}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              {/* 다중 선택 태그들 */}
              {multiple && selectedValues.length > 1 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedValues.slice(0, 3).map(val => {
                    const option = getSelectedOption(val)
                    return (
                      <span
                        key={val}
                        className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        {option?.label || val}
                        <button
                          onClick={(e) => handleRemoveValue(val, e)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                  {selectedValues.length > 3 && (
                    <span className="text-gray-500 text-sm">
                      +{selectedValues.length - 3}개
                    </span>
                  )}
                </div>
              ) : (
                <span className="truncate">{renderValue()}</span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {/* 지우기 버튼 */}
              {clearable && selectedValues.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* 화살표 */}
              <ChevronDown className={clsx(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )} />
            </div>
          </div>
        </div>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div className={clsx(
            'absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
            maxHeight,
            'overflow-hidden'
          )}>
            {/* 검색 입력 */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* 옵션 목록 */}
            <div ref={optionsRef} className="overflow-y-auto" style={{ maxHeight: '200px' }}>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-sm text-gray-500">로딩 중...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  {emptyMessage}
                </div>
              ) : groupBy ? (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                      {group}
                    </div>
                    {groupOptions.map((option, index) => renderOption(option, index))}
                  </div>
                ))
              ) : (
                filteredOptions.map((option, index) => renderOption(option, index))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 도움말 텍스트 또는 에러 메시지 */}
      {(helperText || error || success) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-error-600">{error}</p>
          )}
          {success && !error && (
            <p className="text-sm text-success-600">{success}</p>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
}

// 간단한 Select 컴포넌트
export const Select = ({ options, ...props }) => {
  const formattedOptions = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option }
      : option
  )
  
  return <Dropdown options={formattedOptions} {...props} />
}

// 다중 선택 컴포넌트
export const MultiSelect = (props) => (
  <Dropdown multiple {...props} />
)

// 검색 가능한 Select
export const SearchableSelect = (props) => (
  <Dropdown searchable {...props} />
)

// 국가 선택 드롭다운
export const CountrySelect = (props) => {
  const countries = [
    { value: 'kr', label: '🇰🇷 대한민국' },
    { value: 'us', label: '🇺🇸 미국' },
    { value: 'jp', label: '🇯🇵 일본' },
    { value: 'cn', label: '🇨🇳 중국' },
    { value: 'vn', label: '🇻🇳 베트남' },
    { value: 'th', label: '🇹🇭 태국' },
    { value: 'ph', label: '🇵🇭 필리핀' },
    { value: 'in', label: '🇮🇳 인도' },
    { value: 'id', label: '🇮🇩 인도네시아' },
    { value: 'my', label: '🇲🇾 말레이시아' },
    { value: 'sg', label: '🇸🇬 싱가포르' },
    { value: 'au', label: '🇦🇺 호주' },
    { value: 'ca', label: '🇨🇦 캐나다' },
    { value: 'br', label: '🇧🇷 브라질' },
    { value: 'mx', label: '🇲🇽 멕시코' },
    { value: 'de', label: '🇩🇪 독일' },
    { value: 'fr', label: '🇫🇷 프랑스' },
    { value: 'es', label: '🇪🇸 스페인' },
    { value: 'it', label: '🇮🇹 이탈리아' },
    { value: 'gb', label: '🇬🇧 영국' },
    { value: 'ru', label: '🇷🇺 러시아' },
    { value: 'tr', label: '🇹🇷 터키' },
    { value: 'sa', label: '🇸🇦 사우디아라비아' },
    { value: 'eg', label: '🇪🇬 이집트' },
    { value: 'za', label: '🇿🇦 남아프리카공화국' }
  ]
  
  return (
    <Dropdown
      options={countries}
      searchable
      placeholder="국가를 선택하세요"
      {...props}
    />
  )
}

// 언어 선택 드롭다운
export const LanguageSelect = (props) => {
  const languages = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'th', label: 'ไทย' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'hi', label: 'हिंदी' },
    { value: 'ar', label: 'العربية' },
    { value: 'pt', label: 'Português' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'mn', label: 'Монгол' }
  ]
  
  return (
    <Dropdown
      options={languages}
      searchable
      placeholder="언어를 선택하세요"
      {...props}
    />
  )
}

// 한국어 레벨 선택
export const KoreanLevelSelect = (props) => {
  const levels = [
    { value: 'beginner', label: '초급 (Beginner)', description: '한글과 기초 단어' },
    { value: 'elementary', label: '기초 (Elementary)', description: '간단한 일상 대화' },
    { value: 'intermediate', label: '중급 (Intermediate)', description: '일반적인 주제 토론' },
    { value: 'advanced', label: '고급 (Advanced)', description: '복잡한 주제와 전문 용어' },
    { value: 'native', label: '원어민 수준 (Native)', description: '완벽한 한국어 구사' }
  ]
  
  return (
    <Dropdown
      options={levels}
      placeholder="한국어 수준을 선택하세요"
      optionRenderer={(option) => (
        <div>
          <div className="font-medium">{option.label}</div>
          <div className="text-xs text-gray-500">{option.description}</div>
        </div>
      )}
      {...props}
    />
  )
}

// SpitKorean 상품 선택
export const ProductSelect = (props) => {
  const products = [
    { 
      value: 'talk', 
      label: 'Talk Like You Mean It',
      description: 'AI 대화 학습',
      price: '$30/월',
      icon: '💬'
    },
    { 
      value: 'drama', 
      label: 'Drama Builder',
      description: '드라마 문장 구성',
      price: '$20/월',
      icon: '🎬'
    },
    { 
      value: 'test', 
      label: 'Test & Study',
      description: 'TOPIK 시험 대비',
      price: '$20/월',
      icon: '📚'
    },
    { 
      value: 'journey', 
      label: 'Korean Journey',
      description: '발음 및 읽기 학습',
      price: '$30/월',
      icon: '🗺️'
    }
  ]
  
  return (
    <Dropdown
      options={products}
      multiple
      placeholder="학습하고 싶은 상품을 선택하세요"
      optionRenderer={(option) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{option.icon}</span>
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </div>
          <span className="text-sm font-medium text-primary-600">{option.price}</span>
        </div>
      )}
      {...props}
    />
  )
}

export default Dropdown