// frontend/src/shared/types/subscription.ts

/**
 * 구독 관련 타입 정의
 * Stripe 결제 시스템과 연동된 TypeScript 타입
 */

// 기본 구독 플랜
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'semi_annual' | 'annual' | 'lifetime';
  dailyLimit: number;
  features: string[];
  icon: string;
  color: string;
  category: 'conversation' | 'grammar' | 'test' | 'reading';
  isPopular?: boolean;
  isRecommended?: boolean;
}

// 번들 플랜
export interface BundlePlan {
  id: string;
  name: string;
  description: string;
  discount: number; // 0.1 = 10% 할인
  minProducts: number;
  maxProducts: number;
  price?: number; // 고정 가격 (올인원 패키지)
  originalPrice?: number;
  icon: string;
  color: string;
  eligibleProducts?: string[]; // 포함 가능한 상품 ID
}

// 활성 구독
export interface ActiveSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  cancelDate?: string;
  pauseDate?: string;
  autoRenew: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  paymentMethod: PaymentMethod;
  billing: BillingInfo;
  usage: UsageInfo;
}

// 구독 상태
export type SubscriptionStatus = 
  | 'active'          // 활성
  | 'trialing'        // 체험중
  | 'past_due'        // 결제 연체
  | 'canceled'        // 취소됨
  | 'unpaid'          // 미결제
  | 'paused'          // 일시정지
  | 'incomplete'      // 불완전
  | 'incomplete_expired'; // 불완전 만료

// 결제 방법
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | 'digital_wallet';
  brand?: string; // visa, mastercard, amex 등
  last4?: string; // 카드 끝 4자리
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingAddress?: BillingAddress;
}

// 청구 주소
export interface BillingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// 청구 정보
export interface BillingInfo {
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  lastPaymentStatus?: PaymentStatus;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
}

// 결제 상태
export type PaymentStatus = 
  | 'succeeded'       // 성공
  | 'pending'         // 대기중
  | 'failed'          // 실패
  | 'canceled'        // 취소
  | 'requires_action' // 추가 인증 필요
  | 'processing';     // 처리중

// 사용량 정보
export interface UsageInfo {
  product: string;
  currentPeriodUsage: number;
  dailyLimit: number;
  remainingToday: number;
  usageHistory: DailyUsage[];
  resetTime: string; // 일일 리셋 시간
}

// 일일 사용량
export interface DailyUsage {
  date: string;
  usage: number;
  limit: number;
}

// 구독 요청
export interface SubscriptionRequest {
  planId: string;
  billingPeriod?: 'monthly' | 'annual';
  paymentMethodId?: string;
  couponCode?: string;
  autoRenew?: boolean;
}

// 번들 구독 요청
export interface BundleSubscriptionRequest {
  bundleId: string;
  selectedProducts: string[];
  billingPeriod?: 'monthly' | 'annual';
  paymentMethodId?: string;
  couponCode?: string;
  autoRenew?: boolean;
}

// 구독 변경 요청
export interface SubscriptionChangeRequest {
  subscriptionId: string;
  newPlanId?: string;
  billingPeriod?: 'monthly' | 'annual';
  autoRenew?: boolean;
  changeDate?: string; // 변경 적용 날짜
}

// 구독 취소 요청
export interface SubscriptionCancelRequest {
  subscriptionId: string;
  reason?: string;
  feedback?: string;
  cancelImmediately?: boolean; // 즉시 취소 vs 기간 만료 시 취소
}

// 구독 일시정지 요청
export interface SubscriptionPauseRequest {
  subscriptionId: string;
  pauseDuration: number; // 일 단위
  reason?: string;
}

// 쿠폰/할인
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number; // 할인율(%) 또는 할인금액
  currency?: string; // fixed_amount인 경우
  minimumAmount?: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  validFrom: string;
  validUntil?: string;
  applicableProducts?: string[];
  firstTimeOnly?: boolean;
  isActive: boolean;
}

// 결제 내역
export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  paidAt?: string;
  createdAt: string;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: string;
}

// 인보이스
export interface Invoice {
  id: string;
  subscriptionId: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  taxAmount?: number;
  discountAmount?: number;
  subtotal: number;
  total: number;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  downloadUrl?: string;
  items: InvoiceItem[];
}

// 인보이스 항목
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: {
    start: string;
    end: string;
  };
}

// 구독 통계
export interface SubscriptionAnalytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  retentionRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionRate: number;
  trialToPayingRate: number;
}

// 사용자별 구독 통계
export interface UserSubscriptionStats {
  totalSpent: number;
  subscriptionAge: number; // 일 단위
  averageMonthlyUsage: number;
  usageEfficiency: number; // 사용량/한도 비율
  favoriteProduct: string;
  streakDays: number;
  upgradeHistory: SubscriptionChange[];
}

// 구독 변경 이력
export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  type: 'created' | 'upgraded' | 'downgraded' | 'canceled' | 'paused' | 'resumed';
  fromPlan?: string;
  toPlan?: string;
  reason?: string;
  effectiveDate: string;
  createdAt: string;
}

// 구독 알림
export interface SubscriptionNotification {
  id: string;
  userId: string;
  type: 'payment_due' | 'payment_failed' | 'trial_ending' | 'subscription_canceled' | 'usage_limit';
  title: string;
  message: string;
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

// 체험판 정보
export interface TrialInfo {
  isEligible: boolean;
  duration: number; // 일 단위
  daysRemaining?: number;
  features: string[];
  limitations: string[];
  convertUrl?: string;
}

// 요금제 비교
export interface PlanComparison {
  plans: SubscriptionPlan[];
  features: ComparisonFeature[];
  recommendations: PlanRecommendation[];
}

// 비교 기능
export interface ComparisonFeature {
  id: string;
  name: string;
  description?: string;
  category: string;
  planSupport: {
    [planId: string]: boolean | string | number;
  };
}

// 요금제 추천
export interface PlanRecommendation {
  planId: string;
  reason: string;
  confidence: number; // 0-1
  basedOn: ('usage' | 'goals' | 'level' | 'preferences')[];
}

// 타입 가드 함수들
export const isActiveSubscription = (status: SubscriptionStatus): boolean => {
  return ['active', 'trialing'].includes(status);
};

export const isPastDueSubscription = (status: SubscriptionStatus): boolean => {
  return ['past_due', 'unpaid'].includes(status);
};

export const isCanceledSubscription = (status: SubscriptionStatus): boolean => {
  return ['canceled', 'incomplete_expired'].includes(status);
};

export const isPaymentSuccessful = (status: PaymentStatus): boolean => {
  return status === 'succeeded';
};

export const isPaymentPending = (status: PaymentStatus): boolean => {
  return ['pending', 'processing', 'requires_action'].includes(status);
};

export const isPaymentFailed = (status: PaymentStatus): boolean => {
  return ['failed', 'canceled'].includes(status);
};

// 유틸리티 타입
export type SubscriptionPlanId = 'talk' | 'drama' | 'test' | 'journey';
export type BundlePlanId = 'bundle_2' | 'bundle_3' | 'bundle_all';
export type PlanId = SubscriptionPlanId | BundlePlanId;