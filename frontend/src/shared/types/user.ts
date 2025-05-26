// frontend/src/shared/types/user.ts

/**
 * 사용자 관련 타입 정의
 * 백엔드 모델과 동기화된 TypeScript 타입
 */

// 기본 사용자 정보
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  subscriptions: UserSubscription[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// 사용자 프로필
export interface UserProfile {
  name: string;
  nativeLanguage: string;
  koreanLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  avatar?: string;
  timezone?: string;
  dateOfBirth?: string;
}

// 사용자 구독 정보
export interface UserSubscription {
  product: 'talk' | 'drama' | 'test' | 'journey';
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'trial';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

// 사용자 환경설정
export interface UserPreferences {
  studyGoals: string[];
  dailyStudyTime: number; // 분 단위
  notifications: NotificationSettings;
  language: LanguageSettings;
  audio: AudioSettings;
  display: DisplaySettings;
}

// 알림 설정
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:MM 형식
  weeklyReport: boolean;
  achievements: boolean;
  streakReminder: boolean;
}

// 언어 설정
export interface LanguageSettings {
  interfaceLanguage: string; // UI 표시 언어
  explanationLanguage: string; // 해설 언어
  autoTranslate: boolean;
}

// 오디오 설정
export interface AudioSettings {
  ttsSpeed: number; // 0.5 ~ 2.0
  ttsVoice: 'female' | 'male';
  volume: number; // 0 ~ 100
  autoPlay: boolean;
}

// 화면 설정
export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  compactMode: boolean;
  showHangul: boolean; // 한글 표시 여부
  showRomanization: boolean; // 로마자 표시 여부
}

// 게임화 데이터
export interface UserGamification {
  id: string;
  userId: string;
  streakDays: number;
  longestStreak: number;
  totalXP: number;
  weeklyXP: number;
  currentLeague: 'bronze' | 'silver' | 'gold' | 'diamond';
  achievements: Achievement[];
  lastActivityDate: string;
  weeklyProgress: WeeklyProgress;
}

// 성취/배지
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'streak' | 'completion' | 'accuracy' | 'social' | 'special';
}

// 주간 진행도
export interface WeeklyProgress {
  xp: number;
  rank: number;
  totalUsers: number;
  activities: {
    [key: string]: number; // 활동별 완료 수
  };
}

// 사용자 통계
export interface UserStats {
  totalStudyTime: number; // 총 학습 시간 (분)
  totalSessions: number; // 총 세션 수
  averageSessionTime: number; // 평균 세션 시간 (분)
  completionRate: number; // 완료율 (%)
  accuracyRate: number; // 정확도 (%)
  streakDays: number; // 연속 학습일
  favoriteProduct: string; // 가장 많이 사용한 상품
  levelProgress: {
    [product: string]: {
      currentLevel: string;
      progress: number; // 0-100%
      nextLevelRequirement: number;
    };
  };
}

// 사용자 활동 기록
export interface UserActivity {
  id: string;
  userId: string;
  activityType: 'login' | 'talk_chat' | 'drama_complete' | 'test_complete' | 'journey_complete' | 'subscribe' | 'cancel';
  product?: 'talk' | 'drama' | 'test' | 'journey';
  timestamp: string;
  metadata?: Record<string, any>;
  xpEarned?: number;
}

// 사용자 피드백
export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug' | 'suggestion' | 'complaint' | 'compliment';
  category: string;
  title: string;
  description: string;
  rating?: number; // 1-5
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// 사용자 생성 요청
export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  nativeLanguage?: string;
  koreanLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  studyGoals?: string[];
  dailyStudyTime?: number;
}

// 사용자 업데이트 요청
export interface UpdateUserRequest {
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 로그인 응답
export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// 비밀번호 재설정 요청
export interface PasswordResetRequest {
  email: string;
}

// 비밀번호 변경 요청
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// 이메일 인증 요청
export interface EmailVerificationRequest {
  token: string;
}

// 사용자 검색 필터
export interface UserSearchFilter {
  email?: string;
  name?: string;
  nativeLanguage?: string;
  koreanLevel?: string;
  hasActiveSubscription?: boolean;
  registeredAfter?: string;
  registeredBefore?: string;
  lastActivityAfter?: string;
  lastActivityBefore?: string;
}

// 사용자 목록 응답
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 사용자 상태
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

// 사용자 역할 (관리자용)
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

// 확장된 사용자 정보 (관리자용)
export interface ExtendedUser extends User {
  status: UserStatus;
  role: UserRole;
  lastLoginAt?: string;
  loginCount: number;
  ipAddress?: string;
  deviceInfo?: string;
  referralCode?: string;
  referredBy?: string;
}

// 타입 가드 함수들
export const isValidKoreanLevel = (level: string): level is UserProfile['koreanLevel'] => {
  return ['beginner', 'intermediate', 'advanced'].includes(level);
};

export const isValidSubscriptionStatus = (status: string): status is UserSubscription['status'] => {
  return ['active', 'cancelled', 'expired', 'pending', 'trial'].includes(status);
};

export const isValidProductType = (product: string): product is UserSubscription['product'] => {
  return ['talk', 'drama', 'test', 'journey'].includes(product);
};

// 기본값 상수
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  studyGoals: [],
  dailyStudyTime: 15,
  notifications: {
    email: true,
    push: true,
    dailyReminder: true,
    reminderTime: '19:00',
    weeklyReport: true,
    achievements: true,
    streakReminder: true
  },
  language: {
    interfaceLanguage: 'ko',
    explanationLanguage: 'en',
    autoTranslate: false
  },
  audio: {
    ttsSpeed: 1.0,
    ttsVoice: 'female',
    volume: 80,
    autoPlay: true
  },
  display: {
    theme: 'light',
    fontSize: 'medium',
    fontFamily: 'system',
    compactMode: false,
    showHangul: true,
    showRomanization: false
  }
};