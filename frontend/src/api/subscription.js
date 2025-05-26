// src/api/subscription.js
import apiClient from './index';

/**
 * Subscription API
 * 백엔드 routes/common.py의 구독 관련 API와 매칭
 */

/**
 * 구독 상품 정보 조회
 * GET /api/v1/common/subscription/plans
 * @returns {Promise} 구독 상품 목록
 */
export const getSubscriptionPlans = async () => {
  const response = await apiClient.get('/common/subscription/plans');
  return response.data;
};

/**
 * 내 구독 목록 조회
 * GET /api/v1/common/subscription/my-subscriptions
 * @returns {Promise} 내 구독 목록
 */
export const getMySubscriptions = async () => {
  const response = await apiClient.get('/common/subscription/my-subscriptions');
  return response.data;
};

/**
 * 구독 생성
 * POST /api/v1/common/subscription/subscribe
 * @param {Object} subscriptionData - 구독 데이터
 * @param {string} subscriptionData.plan_id - 상품 ID 또는 번들 ID
 * @param {Array} subscriptionData.products - 번들의 경우 상품 목록
 * @param {string} subscriptionData.billing_cycle - monthly | annual
 * @param {Object} subscriptionData.payment_method - 결제 수단 정보
 * @returns {Promise} 구독 생성 결과
 */
export const createSubscription = async (subscriptionData) => {
  const response = await apiClient.post('/common/subscription/subscribe', subscriptionData);
  return response.data;
};

/**
 * 구독 취소
 * POST /api/v1/subscription/cancel/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @returns {Promise} 취소 결과
 */
export const cancelSubscription = async (subscriptionId) => {
  const response = await apiClient.post(`/subscription/cancel/${subscriptionId}`);
  return response.data;
};

/**
 * 구독 일시정지
 * POST /api/v1/subscription/pause/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @returns {Promise} 일시정지 결과
 */
export const pauseSubscription = async (subscriptionId) => {
  const response = await apiClient.post(`/subscription/pause/${subscriptionId}`);
  return response.data;
};

/**
 * 구독 재개
 * POST /api/v1/subscription/resume/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @returns {Promise} 재개 결과
 */
export const resumeSubscription = async (subscriptionId) => {
  const response = await apiClient.post(`/subscription/resume/${subscriptionId}`);
  return response.data;
};

/**
 * 결제 수단 업데이트
 * PUT /api/v1/subscription/payment-method/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @param {Object} paymentMethodData - 새 결제 수단 정보
 * @returns {Promise} 업데이트 결과
 */
export const updatePaymentMethod = async (subscriptionId, paymentMethodData) => {
  const response = await apiClient.put(`/subscription/payment-method/${subscriptionId}`, paymentMethodData);
  return response.data;
};

/**
 * 결제 내역 조회
 * GET /api/v1/subscription/billing-history
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.limit - 조회 개수 (기본값: 20)
 * @param {number} params.skip - 건너뛸 개수 (기본값: 0)
 * @returns {Promise} 결제 내역
 */
export const getBillingHistory = async (params = {}) => {
  const queryParams = new URLSearchParams({
    limit: params.limit || 20,
    skip: params.skip || 0,
    ...params
  });
  
  const response = await apiClient.get(`/subscription/billing-history?${queryParams}`);
  return response.data;
};

/**
 * 사용량 통계 조회
 * GET /api/v1/subscription/usage-stats
 * @returns {Promise} 사용량 통계
 */
export const getUsageStats = async () => {
  const response = await apiClient.get('/subscription/usage-stats');
  return response.data;
};

/**
 * 결제 처리
 * POST /api/v1/subscription/process-payment
 * @param {Object} paymentData - 결제 데이터
 * @param {Array} paymentData.products - 구독할 상품 목록
 * @param {string} paymentData.billing_cycle - monthly | annual
 * @param {string} paymentData.payment_method - card | paypal | google
 * @param {number} paymentData.amount - 결제 금액
 * @param {string} paymentData.discount_code - 할인 코드 (선택사항)
 * @param {Object} paymentData.payment_details - 결제 상세 정보
 * @returns {Promise} 결제 결과
 */
export const processPayment = async (paymentData) => {
  const response = await apiClient.post('/subscription/process-payment', paymentData);
  return response.data;
};

/**
 * 할인 코드 검증
 * POST /api/v1/subscription/validate-discount
 * @param {string} discountCode - 할인 코드
 * @returns {Promise} 할인 코드 정보
 */
export const validateDiscountCode = async (discountCode) => {
  const response = await apiClient.post('/subscription/validate-discount', { 
    discount_code: discountCode 
  });
  return response.data;
};

/**
 * 영수증 다운로드
 * GET /api/v1/subscription/invoice/{invoiceId}
 * @param {string} invoiceId - 영수증 ID
 * @returns {Promise} 영수증 파일
 */
export const downloadInvoice = async (invoiceId) => {
  const response = await apiClient.get(`/subscription/invoice/${invoiceId}`, {
    responseType: 'blob'
  });
  
  // 파일 다운로드 처리
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
};

/**
 * 구독 업그레이드/다운그레이드
 * PUT /api/v1/subscription/change-plan/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @param {Object} planChangeData - 플랜 변경 데이터
 * @param {string} planChangeData.new_plan_id - 새 플랜 ID
 * @param {string} planChangeData.change_type - upgrade | downgrade
 * @returns {Promise} 플랜 변경 결과
 */
export const changePlan = async (subscriptionId, planChangeData) => {
  const response = await apiClient.put(`/subscription/change-plan/${subscriptionId}`, planChangeData);
  return response.data;
};

/**
 * 프로모션 코드 적용
 * POST /api/v1/subscription/apply-promo
 * @param {Object} promoData - 프로모션 데이터
 * @param {string} promoData.promo_code - 프로모션 코드
 * @param {Array} promoData.products - 적용할 상품 목록
 * @returns {Promise} 프로모션 적용 결과
 */
export const applyPromoCode = async (promoData) => {
  const response = await apiClient.post('/subscription/apply-promo', promoData);
  return response.data;
};

/**
 * 구독 갱신 설정 변경
 * PUT /api/v1/subscription/auto-renewal/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @param {boolean} autoRenewal - 자동 갱신 여부
 * @returns {Promise} 설정 변경 결과
 */
export const updateAutoRenewal = async (subscriptionId, autoRenewal) => {
  const response = await apiClient.put(`/subscription/auto-renewal/${subscriptionId}`, {
    auto_renewal: autoRenewal
  });
  return response.data;
};

/**
 * 결제 실패 재시도
 * POST /api/v1/subscription/retry-payment/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @returns {Promise} 재시도 결과
 */
export const retryPayment = async (subscriptionId) => {
  const response = await apiClient.post(`/subscription/retry-payment/${subscriptionId}`);
  return response.data;
};

/**
 * 구독 상태 조회
 * GET /api/v1/subscription/status/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @returns {Promise} 구독 상태 정보
 */
export const getSubscriptionStatus = async (subscriptionId) => {
  const response = await apiClient.get(`/subscription/status/${subscriptionId}`);
  return response.data;
};

/**
 * 결제 예정 알림 설정
 * PUT /api/v1/subscription/payment-reminders/{subscriptionId}
 * @param {string} subscriptionId - 구독 ID
 * @param {Object} reminderSettings - 알림 설정
 * @param {boolean} reminderSettings.email_enabled - 이메일 알림 여부
 * @param {number} reminderSettings.days_before - 며칠 전 알림
 * @returns {Promise} 설정 결과
 */
export const updatePaymentReminders = async (subscriptionId, reminderSettings) => {
  const response = await apiClient.put(`/subscription/payment-reminders/${subscriptionId}`, reminderSettings);
  return response.data;
};

// 백엔드 응답 구조 (참고용 주석)
/**
 * 구독 상품 정보 응답 구조
 * {
 *   "status": "success",
 *   "message": "구독 상품 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "plans": [
 *       {
 *         "id": "talk",
 *         "name": "Talk Like You Mean It",
 *         "description": "자연스러운 대화 학습에 중점을 둔 플랜",
 *         "price": 30.00,
 *         "daily_limit": 60,
 *         "features": ["AI 튜터와 실시간 대화", "감정 인식 및 피드백", ...]
 *       }
 *     ],
 *     "bundles": [
 *       {
 *         "id": "bundle_2",
 *         "name": "2개 선택 패키지",
 *         "description": "원하는 상품 2개를 선택하여 10% 할인",
 *         "discount": 0.10,
 *         "min_products": 2,
 *         "max_products": 2
 *       }
 *     ]
 *   }
 * }
 */

/**
 * 내 구독 목록 응답 구조
 * {
 *   "status": "success",
 *   "message": "구독 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "subscriptions": [
 *       {
 *         "id": "sub_1234567890",
 *         "product": "talk",
 *         "status": "active",
 *         "billing_cycle": "monthly",
 *         "amount": 30.00,
 *         "next_billing_date": "2024-02-01T00:00:00Z",
 *         "started_date": "2024-01-01T00:00:00Z",
 *         "payment_method": "**** 1234",
 *         "auto_renewal": true
 *       }
 *     ]
 *   }
 * }
 */

/**
 * 결제 내역 응답 구조
 * {
 *   "status": "success", 
 *   "message": "결제 내역을 성공적으로 조회했습니다",
 *   "data": {
 *     "history": [
 *       {
 *         "id": "inv_1234567890",
 *         "date": "2024-01-01T00:00:00Z",
 *         "amount": 30.00,
 *         "status": "paid",
 *         "products": ["talk"],
 *         "invoice_url": "https://...",
 *         "payment_method": "**** 1234"
 *       }
 *     ],
 *     "total": 100,
 *     "has_more": true
 *   }
 * }
 */

/**
 * 사용량 통계 응답 구조
 * {
 *   "status": "success",
 *   "message": "사용량 통계를 성공적으로 조회했습니다",
 *   "data": {
 *     "talk": {
 *       "used": 45,
 *       "limit": 60,
 *       "reset_date": "2024-02-01T00:00:00Z"
 *     },
 *     "drama": {
 *       "used": 15,
 *       "limit": 20,
 *       "reset_date": "2024-02-01T00:00:00Z"
 *     }
 *   }
 * }
 */

/**
 * 할인 코드 검증 응답 구조
 * {
 *   "status": "success",
 *   "message": "할인 코드가 유효합니다",
 *   "data": {
 *     "code": "WELCOME10",
 *     "discount_rate": 0.10,
 *     "description": "신규 가입 10% 할인",
 *     "valid_until": "2024-12-31T23:59:59Z",
 *     "applicable_products": ["talk", "drama", "test", "journey"]
 *   }
 * }
 */