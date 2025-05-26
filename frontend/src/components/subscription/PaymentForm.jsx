// src/components/subscription/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Lock, 
  Check,
  AlertCircle,
  Gift,
  Shield,
  Loader2,
  X
} from 'lucide-react';
// 컴포넌트
import Card from '../common/Card';
import Button, { PrimaryButton } from '../common/Button';
import Input from '../common/Input';
import TranslatableText, { T } from '../common/TranslatableText';
// Redux
import { 
  createSubscription, 
  validateDiscountCode,
  selectPaymentLoading,
  selectPaymentError,
  selectDiscountCode,
  selectDiscountLoading,
  clearDiscountCode,
  resetPaymentState
} from '../../store/slices/subscriptionSlice';
// 유틸리티
import { formatPrice } from '../../utils/format';

const PaymentForm = ({ 
  plan,
  billingPeriod = 'monthly',
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  discount = 0,
  promoCode = '',
  isLoading = false
}) => {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  
  // Redux 상태
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);
  const discountCode = useSelector(selectDiscountCode);
  const discountLoading = useSelector(selectDiscountLoading);

  // 폼 상태
  const [paymentData, setPaymentData] = useState({
    email: '',
    name: '',
    billingAddress: {
      country: 'US',
      postalCode: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showPromoCode, setShowPromoCode] = useState(!!promoCode);
  const [currentPromoCode, setCurrentPromoCode] = useState(promoCode);
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAutoRenewal, setAgreedToAutoRenewal] = useState(false);

  // 가격 계산
  const basePrice = plan?.price || 0;
  const annualDiscount = billingPeriod === 'annual' ? 0.2 : 0; // 연간 20% 할인
  const promoDiscount = discountCode?.discount || 0; // 프로모 코드 할인
  const totalDiscount = discount + annualDiscount + promoDiscount;
  const discountAmount = basePrice * totalDiscount;
  const finalPrice = basePrice - discountAmount;
  const tax = finalPrice * 0.08; // 8% 세금
  const total = finalPrice + tax;

  // 연간 결제 시 총액
  const yearlyTotal = billingPeriod === 'annual' ? total * 12 : total;

  // 컴포넌트 마운트 시 결제 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  // 프로모 코드 적용 효과
  useEffect(() => {
    if (discountCode) {
      setPromoCodeApplied(true);
      setShowPromoCode(false);
    }
  }, [discountCode]);

  // 입력값 변경 처리
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 이메일
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!paymentData.email || !emailRegex.test(paymentData.email)) {
      newErrors.email = '유효한 이메일을 입력해주세요';
    }

    // 이름
    if (!paymentData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    // 이용약관 동의
    if (!agreedToTerms) {
      newErrors.terms = '이용약관에 동의해주세요';
    }

    if (!agreedToAutoRenewal) {
      newErrors.autoRenewal = '자동 갱신에 동의해주세요';
    }

    // Stripe 카드 요소 확인
    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) {
      newErrors.card = '카드 정보를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 프로모 코드 적용
  const applyPromoCode = async () => {
    if (!currentPromoCode.trim()) return;

    try {
      await dispatch(validateDiscountCode(currentPromoCode)).unwrap();
      setCurrentPromoCode('');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        promoCode: error.message || '유효하지 않은 프로모 코드입니다'
      }));
    }
  };

  // 프로모 코드 제거
  const removePromoCode = () => {
    dispatch(clearDiscountCode());
    setPromoCodeApplied(false);
    setShowPromoCode(false);
  };

  // 결제 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setErrors({ submit: 'Stripe가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.' });
      return;
    }

    if (!validateForm()) return;
    
    setProcessing(true);
    setErrors({});
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      // Stripe로 결제 방법 생성
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: paymentData.name,
          email: paymentData.email,
          address: {
            country: paymentData.billingAddress.country,
            postal_code: paymentData.billingAddress.postalCode,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 구독 생성 요청
      const subscriptionData = {
        plan_id: plan.id,
        billing_period: billingPeriod,
        payment_method_id: paymentMethod.id,
        discount_code: discountCode?.code,
        customer_info: {
          email: paymentData.email,
          name: paymentData.name,
        },
        billing_address: paymentData.billingAddress,
      };

      const result = await dispatch(createSubscription(subscriptionData)).unwrap();
      
      // 3D Secure 등 추가 인증이 필요한 경우
      if (result.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.client_secret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }
      
      // 결제 성공
      onPaymentSuccess?.({
        plan,
        billingPeriod,
        amount: total,
        subscription: result.subscription,
        paymentMethod: {
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand
        }
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ submit: error.message || '결제 처리 중 오류가 발생했습니다' });
      onPaymentError?.(error.message || '결제 처리 중 오류가 발생했습니다');
    } finally {
      setProcessing(false);
    }
  };

  // Stripe CardElement 스타일
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <Card className="shadow-lg border border-gray-200 max-w-2xl mx-auto" padding="none">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                <T>결제 정보</T>
              </h2>
              <p className="text-sm text-gray-600">
                <T>안전하고 빠른 결제</T>
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 주문 요약 */}
        <Card variant="info" padding="default">
          <h3 className="font-medium text-gray-900 mb-3">
            <T>주문 요약</T>
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">
                <T>{plan?.name}</T>
              </span>
              <span className="text-gray-900">
                {formatPrice(basePrice)}/<T>월</T>
              </span>
            </div>
            
            {billingPeriod === 'annual' && (
              <div className="flex justify-between text-green-600">
                <span><T>연간 결제 할인 (20%)</T></span>
                <span>-{formatPrice(basePrice * annualDiscount)}</span>
              </div>
            )}
            
            {discountCode && (
              <div className="flex justify-between text-green-600">
                <span><T>프로모 코드 할인</T> ({discountCode.code})</span>
                <span>-{formatPrice(basePrice * promoDiscount)}</span>
              </div>
            )}
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span><T>추가 할인</T></span>
                <span>-{formatPrice(basePrice * discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600"><T>세금</T></span>
              <span className="text-gray-900">{formatPrice(tax)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-900"><T>총 결제 금액</T></span>
                <span className="text-gray-900">{formatPrice(total)}</span>
              </div>
              {billingPeriod === 'annual' && (
                <div className="text-sm text-gray-600 text-right mt-1">
                  <T>연간</T> {formatPrice(yearlyTotal)}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 프로모 코드 */}
        {!discountCode && (
          <div className="space-y-3">
            {!showPromoCode ? (
              <button
                onClick={() => setShowPromoCode(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <Gift className="w-4 h-4" />
                <T>프로모 코드가 있으신가요?</T>
              </button>
            ) : (
              <div className="flex space-x-2">
                <Input
                  value={currentPromoCode}
                  onChange={(e) => setCurrentPromoCode(e.target.value)}
                  placeholder="프로모 코드 입력"
                  error={errors.promoCode}
                  disabled={discountLoading}
                />
                <Button
                  onClick={applyPromoCode}
                  variant="outline"
                  size="sm"
                  disabled={discountLoading || !currentPromoCode.trim()}
                >
                  {discountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <T>적용</T>}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 적용된 프로모 코드 */}
        {discountCode && (
          <Card variant="success" padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  <T>프로모 코드 적용됨</T>: {discountCode.code}
                </span>
              </div>
              <button
                onClick={removePromoCode}
                className="text-green-600 hover:text-green-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}

        {/* 결제 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 결제 오류 표시 */}
          {(errors.submit || paymentError) && (
            <Card variant="error" padding="sm">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">
                  {errors.submit || paymentError}
                </span>
              </div>
            </Card>
          )}

          {/* 카드 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <T>카드 정보</T>
            </h3>
            
            {/* Stripe CardElement */}
            <div className="border border-gray-300 rounded-lg p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
            {errors.card && (
              <p className="text-sm text-red-600">{errors.card}</p>
            )}
          </div>

          {/* 청구 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              <T>청구 정보</T>
            </h3>
            
            <Input
              label="이메일"
              labelKey="이메일"
              type="email"
              value={paymentData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              error={errors.email}
              required
            />

            <Input
              label="이름"
              labelKey="이름"
              value={paymentData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="홍길동"
              error={errors.name}
              required
            />
          </div>

          {/* 보안 정보 */}
          <Card variant="info" padding="default">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">
                  <T>안전한 결제</T>
                </p>
                <p className="text-blue-700">
                  <T>모든 결제 정보는 SSL 암호화로 보호되며, PCI DSS 표준을 준수합니다. 카드 정보는 저장되지 않습니다.</T>
                </p>
              </div>
            </div>
          </Card>

          {/* 이용약관 동의 */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                <a href="/terms" className="text-blue-600 hover:underline">
                  <T>이용약관</T>
                </a> <T>및</T>{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  <T>개인정보처리방침</T>
                </a><T>에 동의합니다.</T>
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm text-red-600 ml-7">{errors.terms}</p>
            )}
            
            <label className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                checked={agreedToAutoRenewal}
                onChange={(e) => setAgreedToAutoRenewal(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                <T>자동 갱신에 동의합니다. 언제든지 취소할 수 있습니다.</T>
              </span>
            </label>
            {errors.autoRenewal && (
              <p className="text-sm text-red-600 ml-7">{errors.autoRenewal}</p>
            )}
          </div>

          {/* 결제 버튼 */}
          <PrimaryButton
            type="submit"
            disabled={processing || paymentLoading || isLoading || !stripe}
            className="w-full py-4 text-lg font-medium"
          >
            {(processing || paymentLoading) ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <T>결제 처리 중...</T>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>
                  {formatPrice(total)} <T>결제하기</T>
                  {billingPeriod === 'annual' && ` (${<T>연간</T>})`}
                </span>
              </div>
            )}
          </PrimaryButton>

          {/* 환불 정책 */}
          <div className="text-center text-sm text-gray-600">
            <p><T>30일 환불 보장 • 언제든지 취소 가능</T></p>
            <p className="mt-1">
              <T>결제 완료 후 즉시 서비스를 이용할 수 있습니다</T>
            </p>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default PaymentForm;