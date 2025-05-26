// frontend/src/services/stripe.js
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../api/index.js';

/**
 * Stripe 결제 서비스
 * 구독 결제 및 관리를 담당
 * 백엔드 subscription API와 연동
 */
class StripeService {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.isInitialized = false;
    this.publicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  /**
   * Stripe 초기화
   * @returns {Promise<Object>} Stripe 인스턴스
   */
  async initialize() {
    if (this.isInitialized && this.stripe) {
      return this.stripe;
    }

    if (!this.publicKey) {
      throw new Error('Stripe 공개 키가 설정되지 않았습니다.');
    }

    this.stripe = await loadStripe(this.publicKey);
    this.isInitialized = true;

    return this.stripe;
  }

  /**
   * 결제 요소 생성
   * @param {Object} options - Elements 옵션
   * @returns {Object} Elements 인스턴스
   */
  async createElements(options = {}) {
    const stripe = await this.initialize();
    
    const defaultOptions = {
      mode: 'subscription',
      currency: 'usd',
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0570de',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '6px'
        }
      }
    };

    this.elements = stripe.elements({
      ...defaultOptions,
      ...options
    });

    return this.elements;
  }

  /**
   * 구독 결제 처리
   * @param {Object} subscriptionData - 구독 데이터
   * @returns {Promise<Object>} 결제 결과
   */
  async processSubscription(subscriptionData) {
    const stripe = await this.initialize();

    // 백엔드에서 결제 의도 생성
    const response = await apiClient.post('/subscription/create-payment-intent', {
      plan_id: subscriptionData.planId,
      products: subscriptionData.products,
      billing_cycle: subscriptionData.billingCycle || 'monthly',
      discount_code: subscriptionData.discountCode
    });

    const { client_secret, subscription_id } = response.data.data;

    // Stripe로 결제 확인
    const result = await stripe.confirmPayment({
      elements: this.elements,
      clientSecret: client_secret,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success?subscription_id=${subscription_id}`,
        payment_method_data: {
          billing_details: subscriptionData.billingDetails
        }
      }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      subscriptionId: subscription_id,
      status: result.paymentIntent?.status,
      clientSecret: client_secret
    };
  }

  /**
   * 일회성 결제 처리
   * @param {Object} paymentData - 결제 데이터
   * @returns {Promise<Object>} 결제 결과
   */
  async processOneTimePayment(paymentData) {
    const stripe = await this.initialize();

    // 백엔드에서 결제 의도 생성
    const response = await apiClient.post('/payment/create-intent', {
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd',
      description: paymentData.description,
      metadata: paymentData.metadata
    });

    const { client_secret, payment_intent_id } = response.data.data;

    // Stripe로 결제 확인
    const result = await stripe.confirmPayment({
      elements: this.elements,
      clientSecret: client_secret,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?payment_intent=${payment_intent_id}`,
        payment_method_data: {
          billing_details: paymentData.billingDetails
        }
      }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      paymentIntentId: payment_intent_id,
      status: result.paymentIntent?.status,
      clientSecret: client_secret
    };
  }

  /**
   * 결제 수단 설정
   * @param {string} customerId - 고객 ID
   * @returns {Promise<Object>} 설정 결과
   */
  async setupPaymentMethod(customerId) {
    const stripe = await this.initialize();

    // 백엔드에서 설정 의도 생성
    const response = await apiClient.post('/payment/create-setup-intent', {
      customer_id: customerId
    });

    const { client_secret, setup_intent_id } = response.data.data;

    // Stripe로 설정 확인
    const result = await stripe.confirmSetup({
      elements: this.elements,
      clientSecret: client_secret,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/setup-complete?setup_intent=${setup_intent_id}`
      }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      setupIntentId: setup_intent_id,
      paymentMethod: result.setupIntent?.payment_method,
      status: result.setupIntent?.status
    };
  }

  /**
   * 구독 업데이트
   * @param {string} subscriptionId - 구독 ID
   * @param {Object} updateData - 업데이트 데이터
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateSubscription(subscriptionId, updateData) {
    const response = await apiClient.put(`/subscription/update/${subscriptionId}`, updateData);
    
    return {
      subscription: response.data.data.subscription,
      prorationAmount: response.data.data.proration_amount,
      effectiveDate: response.data.data.effective_date
    };
  }

  /**
   * 구독 취소
   * @param {string} subscriptionId - 구독 ID
   * @param {Object} options - 취소 옵션
   * @returns {Promise<Object>} 취소 결과
   */
  async cancelSubscription(subscriptionId, options = {}) {
    const response = await apiClient.post(`/subscription/cancel/${subscriptionId}`, {
      at_period_end: options.atPeriodEnd || true,
      cancellation_reason: options.reason || '',
      feedback: options.feedback || ''
    });

    return {
      subscription: response.data.data.subscription,
      cancelAt: response.data.data.cancel_at,
      status: response.data.data.status
    };
  }

  /**
   * 할인 코드 적용
   * @param {string} discountCode - 할인 코드
   * @param {Array} products - 적용할 상품 목록
   * @returns {Promise<Object>} 할인 정보
   */
  async applyDiscountCode(discountCode, products) {
    const response = await apiClient.post('/subscription/validate-discount', {
      discount_code: discountCode,
      products
    });

    return {
      isValid: response.data.data.is_valid,
      discountRate: response.data.data.discount_rate,
      discountAmount: response.data.data.discount_amount,
      description: response.data.data.description,
      validUntil: response.data.data.valid_until,
      applicableProducts: response.data.data.applicable_products
    };
  }

  /**
   * 결제 내역 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} 결제 내역
   */
  async getPaymentHistory(params = {}) {
    const queryParams = new URLSearchParams({
      limit: params.limit || 20,
      skip: params.skip || 0,
      ...params
    });

    const response = await apiClient.get(`/subscription/payment-history?${queryParams}`);
    
    return {
      history: response.data.data.history,
      total: response.data.data.total,
      hasMore: response.data.data.has_more
    };
  }

  /**
   * 청구서 다운로드
   * @param {string} invoiceId - 청구서 ID
   * @returns {Promise<void>}
   */
  async downloadInvoice(invoiceId) {
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
  }

  /**
   * 결제 방법 목록 조회
   * @returns {Promise<Array>} 결제 방법 목록
   */
  async getPaymentMethods() {
    const response = await apiClient.get('/subscription/payment-methods');
    
    return response.data.data.payment_methods.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      } : null,
      isDefault: pm.is_default,
      createdAt: pm.created_at
    }));
  }

  /**
   * 기본 결제 방법 설정
   * @param {string} paymentMethodId - 결제 방법 ID
   * @returns {Promise<Object>} 설정 결과
   */
  async setDefaultPaymentMethod(paymentMethodId) {
    const response = await apiClient.post('/subscription/default-payment-method', {
      payment_method_id: paymentMethodId
    });

    return {
      success: response.data.status === 'success',
      paymentMethod: response.data.data.payment_method
    };
  }

  /**
   * 결제 방법 삭제
   * @param {string} paymentMethodId - 결제 방법 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deletePaymentMethod(paymentMethodId) {
    try {
      await apiClient.delete(`/subscription/payment-method/${paymentMethodId}`);
      return true;
    } catch (error) {
      console.error('결제 방법 삭제 오류:', error);
      return false;
    }
  }

  /**
   * 웹훅 이벤트 처리
   * @param {Object} event - Stripe 웹훅 이벤트
   */
  handleWebhookEvent(event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        this._handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        this._handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        this._handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        this._handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`처리되지 않은 이벤트 타입: ${event.type}`);
    }
  }

  /**
   * 결제 성공 처리
   * @private
   */
  _handlePaymentSucceeded(invoice) {
    // 결제 성공 이벤트 발생
    window.dispatchEvent(new CustomEvent('stripe:payment-succeeded', {
      detail: { invoice }
    }));
  }

  /**
   * 결제 실패 처리
   * @private
   */
  _handlePaymentFailed(invoice) {
    // 결제 실패 이벤트 발생
    window.dispatchEvent(new CustomEvent('stripe:payment-failed', {
      detail: { invoice }
    }));
  }

  /**
   * 구독 업데이트 처리
   * @private
   */
  _handleSubscriptionUpdated(subscription) {
    // 구독 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent('stripe:subscription-updated', {
      detail: { subscription }
    }));
  }

  /**
   * 구독 삭제 처리
   * @private
   */
  _handleSubscriptionDeleted(subscription) {
    // 구독 삭제 이벤트 발생
    window.dispatchEvent(new CustomEvent('stripe:subscription-deleted', {
      detail: { subscription }
    }));
  }

  /**
   * 이벤트 리스너 등록
   * @param {Function} callback - 이벤트 콜백
   * @returns {Function} 클리너 함수
   */
  onStripeEvent(callback) {
    const handlePaymentSucceeded = (event) => callback({ type: 'payment-succeeded', data: event.detail });
    const handlePaymentFailed = (event) => callback({ type: 'payment-failed', data: event.detail });
    const handleSubscriptionUpdated = (event) => callback({ type: 'subscription-updated', data: event.detail });
    const handleSubscriptionDeleted = (event) => callback({ type: 'subscription-deleted', data: event.detail });

    window.addEventListener('stripe:payment-succeeded', handlePaymentSucceeded);
    window.addEventListener('stripe:payment-failed', handlePaymentFailed);
    window.addEventListener('stripe:subscription-updated', handleSubscriptionUpdated);
    window.addEventListener('stripe:subscription-deleted', handleSubscriptionDeleted);

    return () => {
      window.removeEventListener('stripe:payment-succeeded', handlePaymentSucceeded);
      window.removeEventListener('stripe:payment-failed', handlePaymentFailed);
      window.removeEventListener('stripe:subscription-updated', handleSubscriptionUpdated);
      window.removeEventListener('stripe:subscription-deleted', handleSubscriptionDeleted);
    };
  }
}

// 싱글톤 인스턴스 생성
const stripeService = new StripeService();

export default stripeService;