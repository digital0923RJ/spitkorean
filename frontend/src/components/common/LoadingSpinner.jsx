import React from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

/**
 * 로딩 스피너 컴포넌트
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text,
  overlay = false,
  className,
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
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }
  
  // 스피너 컴포넌트
  const Spinner = () => (
    <div className={clsx(
      'flex items-center justify-center',
      text && 'gap-2',
      className
    )}>
      <Loader2 
        className={clsx(
          'animate-spin',
          sizes[size],
          colors[color]
        )}
        {...props}
      />
      {text && (
        <span className={clsx(
          'text-sm font-medium',
          colors[color]
        )}>
          {text}
        </span>
      )}
    </div>
  )
  
  // 오버레이 모드
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <Spinner />
        </div>
      </div>
    )
  }
  
  return <Spinner />
}

// 미리 정의된 로딩 변형들
export const SmallSpinner = (props) => <LoadingSpinner size="sm" {...props} />
export const LargeSpinner = (props) => <LoadingSpinner size="lg" {...props} />
export const OverlaySpinner = (props) => <LoadingSpinner overlay {...props} />

// 페이지 로딩 스피너
export const PageLoader = ({ text = "페이지를 불러오는 중..." }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  </div>
)

// 컴포넌트 로딩 스피너
export const ComponentLoader = ({ text, className }) => (
  <div className={clsx(
    'flex items-center justify-center py-8',
    className
  )}>
    <LoadingSpinner text={text} />
  </div>
)

// 버튼 내부 스피너
export const ButtonSpinner = () => (
  <LoadingSpinner size="sm" color="white" />
)

// 인라인 스피너
export const InlineSpinner = ({ text, ...props }) => (
  <span className="inline-flex items-center gap-1">
    <LoadingSpinner size="xs" {...props} />
    {text && <span className="text-sm">{text}</span>}
  </span>
)

// 카드 로딩 스켈레톤
export const CardSkeleton = ({ className }) => (
  <div className={clsx(
    'animate-pulse bg-white rounded-lg border border-gray-200 p-4',
    className
  )}>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
)

// 리스트 로딩 스켈레톤
export const ListSkeleton = ({ count = 3, className }) => (
  <div className={clsx('space-y-3', className)}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="animate-pulse flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
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

// 텍스트 로딩 스켈레톤
export const TextSkeleton = ({ lines = 3, className }) => (
  <div className={clsx('animate-pulse space-y-2', className)}>
    {Array.from({ length: lines }, (_, index) => (
      <div 
        key={index} 
        className={clsx(
          'h-4 bg-gray-200 rounded',
          index === lines - 1 ? 'w-2/3' : 'w-full'
        )}
      />
    ))}
  </div>
)

// SpitKorean 상품별 특화 로더들
export const TalkLoader = () => (
  <ComponentLoader text="AI가 응답을 생성하고 있습니다..." />
)

export const DramaLoader = () => (
  <ComponentLoader text="문장을 분석하고 있습니다..." />
)

export const TestLoader = () => (
  <ComponentLoader text="문제를 채점하고 있습니다..." />
)

export const JourneyLoader = () => (
  <ComponentLoader text="발음을 분석하고 있습니다..." />
)

// 오디오 로딩 표시기
export const AudioLoader = ({ isRecording = false }) => (
  <div className="flex items-center gap-2">
    <div className={clsx(
      'w-3 h-3 rounded-full',
      isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
    )}></div>
    <span className="text-sm text-gray-600">
      {isRecording ? '녹음 중...' : '음성 처리 중...'}
    </span>
  </div>
)

// 진행률 표시가 있는 로더
export const ProgressLoader = ({ progress = 0, text }) => (
  <div className="flex flex-col items-center gap-3">
    <LoadingSpinner />
    {text && <p className="text-sm text-gray-600">{text}</p>}
    <div className="w-48 bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <span className="text-xs text-gray-500">{progress}%</span>
  </div>
)

// 데이터 로딩 스피너 (표, 차트 등)
export const DataLoader = ({ text = "데이터를 불러오는 중...", rows = 5 }) => (
  <div className="w-full">
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner text={text} />
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-4 w-4"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// 채팅 메시지 로딩 (Talk Like You Mean It 전용)
export const ChatLoadingBubble = () => (
  <div className="flex items-start space-x-3 p-4">
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
      <span className="text-white text-sm font-medium">AI</span>
    </div>
    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
)

// 파일 업로드 로더
export const UploadLoader = ({ fileName, progress = 0 }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" color="primary" />
        <span className="text-sm font-medium text-blue-900">업로드 중...</span>
      </div>
      <span className="text-xs text-blue-600">{progress}%</span>
    </div>
    {fileName && (
      <p className="text-xs text-blue-700 mb-2">{fileName}</p>
    )}
    <div className="w-full bg-blue-200 rounded-full h-1.5">
      <div 
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
)

// 검색 로더
export const SearchLoader = ({ query }) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-2 text-gray-600">
        "{query}"를 검색하고 있습니다...
      </p>
    </div>
  </div>
)

// 결제 처리 로더
export const PaymentLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
      <LoadingSpinner size="xl" color="primary" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">결제 처리 중</h3>
      <p className="mt-2 text-sm text-gray-600">
        잠시만 기다려주세요.<br />
        페이지를 새로고침하지 마세요.
      </p>
    </div>
  </div>
)

// 음성 분석 로더 (Korean Journey 전용)
export const VoiceAnalysisLoader = ({ stage = 'recording' }) => {
  const stages = {
    recording: { text: '음성을 녹음하고 있습니다...', color: 'red' },
    processing: { text: '음성을 분석하고 있습니다...', color: 'blue' },
    analyzing: { text: '발음을 평가하고 있습니다...', color: 'green' }
  }
  
  const currentStage = stages[stage] || stages.processing
  
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className={clsx(
        'w-16 h-16 rounded-full flex items-center justify-center',
        currentStage.color === 'red' && 'bg-red-100',
        currentStage.color === 'blue' && 'bg-blue-100',
        currentStage.color === 'green' && 'bg-green-100'
      )}>
        <LoadingSpinner 
          size="lg" 
          color={currentStage.color === 'red' ? 'error' : currentStage.color === 'green' ? 'success' : 'primary'} 
        />
      </div>
      <p className="text-center text-gray-700 font-medium">
        {currentStage.text}
      </p>
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-2 h-8 rounded-full animate-pulse',
              currentStage.color === 'red' && 'bg-red-400',
              currentStage.color === 'blue' && 'bg-blue-400',
              currentStage.color === 'green' && 'bg-green-400'
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

// 문법 분석 로더 (Drama Builder 전용)
export const GrammarAnalysisLoader = () => (
  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
    <div className="flex items-center justify-center space-x-3">
      <LoadingSpinner color="secondary" />
      <span className="text-gray-700 font-medium">문법을 분석하고 있습니다...</span>
    </div>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>단어 분석</span>
        <span>완료</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>문장 구조 파악</span>
        <LoadingSpinner size="xs" />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>문법 요소 추출</span>
        <span>대기 중</span>
      </div>
    </div>
  </div>
)

// 시험 채점 로더 (Test & Study 전용)
export const GradingLoader = ({ currentQuestion = 1, totalQuestions = 10 }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <div className="text-center">
      <LoadingSpinner size="lg" color="warning" />
      <h3 className="mt-3 text-lg font-semibold text-yellow-900">답안을 채점하고 있습니다</h3>
      <p className="mt-1 text-sm text-yellow-700">
        {currentQuestion}/{totalQuestions} 문제 처리 중
      </p>
      <div className="mt-4 w-full bg-yellow-200 rounded-full h-2">
        <div 
          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        ></div>
      </div>
    </div>
  </div>
)

// 게임화 시스템 전용 로더들 (LoadingSpinner.jsx에 추가할 컴포넌트들)

// XP 계산 로더
export const XPCalculationLoader = ({ xpAmount = 0, className }) => (
  <div className={clsx(
    'bg-yellow-50 border border-yellow-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
        <LoadingSpinner size="lg" color="warning" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-yellow-900">XP 계산 중</h3>
        <p className="text-sm text-yellow-700 mt-1">
          {xpAmount > 0 ? `${xpAmount} XP를 처리하고 있습니다...` : '경험치를 계산하고 있습니다...'}
        </p>
      </div>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-8 bg-yellow-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
)

// 레벨업 확인 로더
export const LevelUpCheckLoader = ({ currentLevel, className }) => (
  <div className={clsx(
    'bg-purple-50 border border-purple-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
        <LoadingSpinner size="lg" color="white" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-purple-900">레벨업 확인 중</h3>
        <p className="text-sm text-purple-700 mt-1">
          {currentLevel ? `레벨 ${currentLevel}에서 승급 가능한지 확인하고 있습니다...` : '레벨 진행 상황을 확인하고 있습니다...'}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
)

// 배지 처리 로더
export const AchievementProcessingLoader = ({ achievementName, className }) => (
  <div className={clsx(
    'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <LoadingSpinner size="lg" color="white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-xs">🏅</span>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">배지 처리 중</h3>
        <p className="text-sm text-gray-600 mt-1">
          {achievementName ? `"${achievementName}" 배지를 확인하고 있습니다...` : '새로운 배지 획득 여부를 확인하고 있습니다...'}
        </p>
      </div>
    </div>
  </div>
)

// 연속 학습 업데이트 로더
export const StreakUpdateLoader = ({ streakDays, className }) => (
  <div className={clsx(
    'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
        <div className="animate-pulse text-white text-2xl">🔥</div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-orange-900">연속 학습 업데이트 중</h3>
        <p className="text-sm text-orange-700 mt-1">
          {streakDays ? `${streakDays}일 연속 기록을 업데이트하고 있습니다...` : '연속 학습 기록을 확인하고 있습니다...'}
        </p>
      </div>
      <div className="flex space-x-1">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-2 h-6 rounded-full animate-pulse',
              i < (streakDays || 0) ? 'bg-orange-400' : 'bg-gray-200'
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
)

// 리더보드 동기화 로더
export const LeaderboardSyncLoader = ({ league, className }) => (
  <div className={clsx(
    'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-900">리더보드 동기화 중</h3>
        <p className="text-sm text-blue-700 mt-1">
          {league ? `${league} 리그 순위를 업데이트하고 있습니다...` : '최신 순위를 불러오고 있습니다...'}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-2xl animate-bounce">🏆</div>
        <div className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🥇</div>
        <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🥈</div>
        <div className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🥉</div>
      </div>
    </div>
  </div>
)

// 게임화 데이터 로딩 스켈레톤
export const GamificationSkeleton = ({ className }) => (
  <div className={clsx('space-y-4', className)}>
    {/* XP 표시 스켈레톤 */}
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
    
    {/* 연속 학습 스켈레톤 */}
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
    
    {/* 배지 그리드 스켈레톤 */}
    <div className="animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
      <div className="grid grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// 리그 승급 처리 로더
export const LeaguePromotionLoader = ({ currentLeague, nextLeague, className }) => (
  <div className={clsx(
    'bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border border-yellow-200 rounded-lg p-8',
    className
  )}>
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-4xl">👑</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <LoadingSpinner size="xs" color="white" />
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">리그 승급 처리 중</h3>
        <p className="text-gray-600">
          {currentLeague && nextLeague ? 
            `${currentLeague}에서 ${nextLeague}로 승급을 처리하고 있습니다...` :
            '리그 승급을 확인하고 있습니다...'
          }
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-2xl mb-1">🥉</div>
          <div className="text-xs text-gray-500">현재</div>
        </div>
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🥈</div>
          <div className="text-xs text-gray-500">승급</div>
        </div>
      </div>
    </div>
  </div>
)

// 게임화 통계 로딩
export const GamificationStatsLoader = ({ className }) => (
  <div className={clsx('grid grid-cols-2 gap-4', className)}>
    {[...Array(4)].map((_, index) => (
      <div key={index} className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// 일일 목표 처리 로더
export const DailyGoalLoader = ({ goalType, className }) => (
  <div className={clsx(
    'bg-green-50 border border-green-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <LoadingSpinner size="lg" color="success" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-green-900">일일 목표 확인 중</h3>
        <p className="text-sm text-green-700 mt-1">
          {goalType ? `${goalType} 목표 달성 여부를 확인하고 있습니다...` : '오늘의 목표 진행 상황을 확인하고 있습니다...'}
        </p>
      </div>
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-green-600 mb-1">
          <span>진행률</span>
          <span>확인 중...</span>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  </div>
)

// 친구 랭킹 로더
export const FriendsRankingLoader = ({ className }) => (
  <div className={clsx(
    'bg-white border border-gray-200 rounded-lg p-6',
    className
  )}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="font-medium text-gray-900">친구 순위 불러오는 중...</span>
      </div>
      <div className="text-2xl">👥</div>
    </div>
    
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
)

// 보상 처리 로더
export const RewardProcessingLoader = ({ rewardType, className }) => (
  <div className={clsx(
    'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-3xl">🎁</span>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-spin">
          <div className="w-full h-full rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">보상 처리 중</h3>
        <p className="text-sm text-gray-600 mt-1">
          {rewardType ? `${rewardType} 보상을 지급하고 있습니다...` : '보상을 준비하고 있습니다...'}
        </p>
      </div>
      
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
)

export default LoadingSpinner