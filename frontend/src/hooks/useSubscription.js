// frontend/src/hooks/useSubscription.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import {
  fetchSubscriptionPlans,
  fetchMySubscriptions,
  fetchBillingHistory,
  fetchUsageStats,
  createSubscription,
  processPayment,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  updatePaymentMethod,
  validateDiscountCode,
  downloadInvoice,
  addSelectedPlan,
  removeSelectedPlan,
  clearSelectedPlans,
  setSelectedPlans,
  setBillingCycle,
  clearDiscountCode,
  setDiscountCode,
  setShowCancelModal,
  setSelectedSubscriptionForCancel,
  setCheckoutStep,
  clearErrors,
  resetPaymentState,
  updateSubscriptionStatus,
  selectPlans,
  selectBundles,
  selectMySubscriptions,
  selectBillingHistory,
  selectUsageStats,
  selectSelectedPlans,
  selectBillingCycle,
  selectDiscountCode,
  selectPaymentLoading,
  selectPaymentError,
  selectPaymentSuccess,
  selectCheckoutStep,
  selectActiveSubscriptions,
  selectHasActiveSubscription,
  selectTotalMonthlyCost,
  selectSubscriptionByProduct
} from '../store/slices/subscriptionSlice.js';
import stripeService from '../services/stripe.js';
import { PRODUCTS, BUNDLES, calculateBundlePrice, getProductById } from '../shared/constants/products.js';
import { toast } from 'react-hot-toast';

/**
 * 구독 관련 커스텀 훅
 * 
 * 기능:
 * 1. 구독 플랜 관리
 * 2. 결제 처리 (Stripe)
 * 3. 구독 상태 관리
 * 4. 사용량 추적
 * 5. 청구서 관리
 * 6. 할인 코드 처리
 */
export const useSubscription = () => {
  const dispatch = useDispatch();
  
  // 상태 선택
  const plans = useSelector(selectPlans);
  const bundles = useSelector(selectBundles);
  const mySubscriptions = useSelector(selectMySubscriptions);
  const billingHistory = useSelector(selectBillingHistory);
  const usageStats = useSelector(selectUsageStats);
  const selectedPlans = useSelector(selectSelectedPlans);
  const billingCycle = useSelector(selectBillingCycle);
  const discountCode = useSelector(selectDiscountCode);
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);
  const paymentSuccess = useSelector(selectPaymentSuccess);
  const checkoutStep = useSelector(selectCheckoutStep);
  const activeSubscriptions = useSelector(selectActiveSubscriptions);
  const totalMonthlyCost = useSelector(selectTotalMonthlyCost);

  /**
   * 초기 데이터 로드
   */
  const initializeSubscription = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchSubscriptionPlans()),
        dispatch(fetchMySubscriptions()),
        dispatch(fetchUsageStats())
      ]);
    } catch (error) {
      console.error('구독 초기화 오류:', error);
    }
  }, [dispatch]);

  /**
   * 결제 내역 로드
   */
  const loadBillingHistory = useCallback(async () => {
    try {
      await dispatch(fetchBillingHistory());
    } catch (error) {
      console.error('결제 내역 로드 오류:', error);
    }
  }, [dispatch]);

  /**
   * 구독 플랜 선택/해제
   */
  const togglePlanSelection = useCallback((planId) => {
    if (selectedPlans.includes(planId)) {
      dispatch(removeSelectedPlan(planId));
    } else {
      // 번들 제한 확인
      if (selectedPlans.length >= 4) {
        toast.error('최대 4개까지 선택 가능합니다.');
        return;
      }
      dispatch(addSelectedPlan(planId));
    }
  }, [dispatch, selectedPlans]);

  /**
   * 구독 플랜 직접 설정
   */
  const setPlans = useCallback((planIds) => {
    if (planIds.length > 4) {
      toast.error('최대 4개까지 선택 가능합니다.');
      return;
    }
    dispatch(setSelectedPlans(planIds));
  }, [dispatch]);

  /**
   * 선택된 플랜 초기화
   */
  const clearPlans = useCallback(() => {
    dispatch(clearSelectedPlans());
  }, [dispatch]);

  /**
   * 결제 주기 변경
   */
  const changeBillingCycle = useCallback((cycle) => {
    dispatch(setBillingCycle(cycle));
  }, [dispatch]);

  /**
   * 할인 코드 검증 및 적용
   */
  const applyDiscountCode = useCallback(async (code) => {
    try {
      const result = await dispatch(validateDiscountCode(code)).unwrap();
      
      if (result.data?.is_valid) {
        dispatch(setDiscountCode(result.data));
        toast.success('할인 코드가 적용되었습니다!');
        return true;
      } else {
        toast.error('유효하지 않은 할인 코드입니다.');
        return false;
      }
    } catch (error) {
      toast.error(error.message || '할인 코드 검증에 실패했습니다.');
      return false;
    }
  }, [dispatch]);

  /**
   * 할인 코드 제거
   */
  const removeDiscountCode = useCallback(() => {
    dispatch(clearDiscountCode());
    toast.success('할인 코드가 제거되었습니다.');
  }, [dispatch]);

  /**
   * 구독 생성 및 결제 처리
   */
  const subscribe = useCallback(async (paymentData) => {
    try {
      // Stripe Elements 확인
      if (!stripeService.elements) {
        throw new Error('결제 정보가 올바르지 않습니다.');
      }

      const subscriptionData = {
        planId: selectedPlans.length === 1 ? selectedPlans[0] : 'bundle',
        products: selectedPlans,
        billingCycle,
        discountCode: discountCode?.code,
        billingDetails: paymentData.billingDetails
      };

      // Stripe 결제 처리
      const stripeResult = await stripeService.processSubscription(subscriptionData);
      
      if (stripeResult.subscriptionId) {
        // 백엔드에서 구독 생성
        const result = await dispatch(createSubscription({
          subscription_id: stripeResult.subscriptionId,
          payment_intent_id: stripeResult.clientSecret,
          products: selectedPlans,
          billing_cycle: billingCycle,
          discount_code: discountCode?.code
        })).unwrap();

        toast.success('구독이 성공적으로 생성되었습니다!');
        dispatch(setCheckoutStep('confirmation'));
        
        return {
          success: true,
          subscriptionId: stripeResult.subscriptionId,
          subscription: result.data?.subscription
        };
      }
      
      throw new Error('결제 처리에 실패했습니다.');
    } catch (error) {
      console.error('구독 생성 오류:', error);
      toast.error(error.message || '구독 생성에 실패했습니다.');
      return { success: false, error: error.message };
    }
  }, [dispatch, selectedPlans, billingCycle, discountCode]);

  /**
   * 구독 취소
   */
  const cancelMySubscription = useCallback(async (subscriptionId, options = {}) => {
    try {
      const result = await dispatch(cancelSubscription(subscriptionId)).unwrap();
      
      // Stripe에서도 취소 처리
      if (options.immediate) {
        await stripeService.cancelSubscription(subscriptionId, {
          atPeriodEnd: false,
          reason: options.reason,
          feedback: options.feedback
        });
      }

      toast.success('구독이 취소되었습니다.');
      return { success: true, subscription: result.data?.subscription };
    } catch (error) {
      console.error('구독 취소 오류:', error);
      toast.error(error.message || '구독 취소에 실패했습니다.');
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * 구독 일시정지
   */
  const pauseMySubscription = useCallback(async (subscriptionId) => {
    try {
      const result = await dispatch(pauseSubscription(subscriptionId)).unwrap();
      toast.success('구독이 일시정지되었습니다.');
      return { success: true, subscription: result.data?.subscription };
    } catch (error) {
      console.error('구독 일시정지 오류:', error);
      toast.error(error.message || '구독 일시정지에 실패했습니다.');
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * 구독 재개
   */
  const resumeMySubscription = useCallback(async (subscriptionId) => {
    try {
      const result = await dispatch(resumeSubscription(subscriptionId)).unwrap();
      toast.success('구독이 재개되었습니다.');
      return { success: true, subscription: result.data?.subscription };
    } catch (error) {
      console.error('구독 재개 오류:', error);
      toast.error(error.message || '구독 재개에 실패했습니다.');
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * 결제 방법 업데이트
   */
  const updatePayment = useCallback(async (subscriptionId, paymentMethodData) => {
    try {
      const result = await dispatch(updatePaymentMethod({
        subscriptionId,
        paymentMethodData
      })).unwrap();
      
      toast.success('결제 방법이 업데이트되었습니다.');
      return { success: true, paymentMethod: result.data?.payment_method };
    } catch (error) {
      console.error('결제 방법 업데이트 오류:', error);
      toast.error(error.message || '결제 방법 업데이트에 실패했습니다.');
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * 청구서 다운로드
   */
  const downloadBill = useCallback(async (invoiceId) => {
    try {
      await dispatch(downloadInvoice(invoiceId)).unwrap();
      toast.success('청구서 다운로드가 시작되었습니다.');
      return { success: true };
    } catch (error) {
      console.error('청구서 다운로드 오류:', error);
      toast.error(error.message || '청구서 다운로드에 실패했습니다.');
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * 특정 상품 구독 여부 확인
   */
  const hasSubscription = useCallback((productId) => {
    return activeSubscriptions.some(sub => 
      sub.product === productId || sub.products?.includes(productId)
    );
  }, [activeSubscriptions]);

  /**
   * 특정 상품의 구독 정보 조회
   */
  const getSubscriptionByProduct = useCallback((productId) => {
    return mySubscriptions.find(sub => 
      sub.product === productId || sub.products?.includes(productId)
    );
  }, [mySubscriptions]);

  /**
   * 구독 상태 확인
   */
  const getSubscriptionStatus = useCallback((productId) => {
    const subscription = getSubscriptionByProduct(productId);
    return subscription?.status || 'inactive';
  }, [getSubscriptionByProduct]);

  /**
   * 사용량 확인
   */
  const getUsageInfo = useCallback((productId) => {
    const stats = usageStats[productId];
    const product = getProductById(productId);
    
    if (!stats || !product) {
      return {
        used: 0,
        limit: product?.dailyLimit || 0,
        remaining: product?.dailyLimit || 0,
        percentage: 0
      };
    }

    const used = stats.daily_used || 0;
    const limit = product.dailyLimit;
    const remaining = Math.max(0, limit - used);
    const percentage = (used / limit) * 100;

    return {
      used,
      limit,
      remaining,
      percentage: Math.min(100, percentage)
    };
  }, [usageStats]);

  /**
   * 선택된 플랜의 총 가격 계산
   */
  const calculateTotalPrice = useMemo(() => {
    if (selectedPlans.length === 0) return 0;
    
    const bundlePrice = calculateBundlePrice(selectedPlans);
    
    // 연간 결제 할인 적용
    const basePrice = billingCycle === 'annual' ? bundlePrice * 12 * 0.8 : bundlePrice;
    
    // 할인 코드 적용
    if (discountCode?.discount_rate) {
      return basePrice * (1 - discountCode.discount_rate);
    }
    
    return basePrice;
  }, [selectedPlans, billingCycle, discountCode]);

  /**
   * 번들 정보 계산
   */
  const getBundleInfo = useMemo(() => {
    const count = selectedPlans.length;
    
    if (count < 2) return null;
    
    let bundleType = null;
    let discount = 0;
    
    if (count === 2) {
      bundleType = BUNDLES.BUNDLE_2;
      discount = BUNDLES.BUNDLE_2.discount;
    } else if (count === 3) {
      bundleType = BUNDLES.BUNDLE_3;
      discount = BUNDLES.BUNDLE_3.discount;
    } else if (count >= 4) {
      bundleType = BUNDLES.BUNDLE_ALL;
      discount = BUNDLES.BUNDLE_ALL.discount;
    }
    
    const originalPrice = selectedPlans.reduce((sum, productId) => {
      const product = getProductById(productId);
      return sum + (product?.price || 0);
    }, 0);
    
    const bundlePrice = calculateBundlePrice(selectedPlans);
    const savings = originalPrice - bundlePrice;
    
    return {
      type: bundleType,
      discount,
      originalPrice,
      bundlePrice,
      savings,
      discountPercentage: Math.round(discount * 100)
    };
  }, [selectedPlans]);

  /**
   * 에러 클리어
   */
  const clearSubscriptionErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  /**
   * 결제 상태 초기화
   */
  const resetPayment = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  /**
   * 체크아웃 단계 변경
   */
  const setStep = useCallback((step) => {
    dispatch(setCheckoutStep(step));
  }, [dispatch]);

  /**
   * 취소 모달 제어
   */
  const showCancelDialog = useCallback((subscriptionId) => {
    dispatch(setSelectedSubscriptionForCancel(subscriptionId));
    dispatch(setShowCancelModal(true));
  }, [dispatch]);

  const hideCancelDialog = useCallback(() => {
    dispatch(setShowCancelModal(false));
    dispatch(setSelectedSubscriptionForCancel(null));
  }, [dispatch]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeSubscription();
  }, [initializeSubscription]);

  // Stripe 이벤트 리스너 설정
  useEffect(() => {
    const cleanup = stripeService.onStripeEvent((event) => {
      switch (event.type) {
        case 'payment-succeeded':
          dispatch(fetchMySubscriptions());
          toast.success('결제가 성공적으로 처리되었습니다!');
          break;
        case 'payment-failed':
          toast.error('결제가 실패했습니다. 다시 시도해주세요.');
          break;
        case 'subscription-updated':
          dispatch(fetchMySubscriptions());
          break;
        case 'subscription-deleted':
          dispatch(fetchMySubscriptions());
          break;
      }
    });

    return cleanup;
  }, [dispatch]);

  return {
    // 상태
    plans,
    bundles,
    mySubscriptions,
    activeSubscriptions,
    billingHistory,
    usageStats,
    selectedPlans,
    billingCycle,
    discountCode,
    checkoutStep,
    
    // 계산된 값
    totalMonthlyCost,
    calculateTotalPrice,
    getBundleInfo,
    
    // 로딩 & 에러 상태
    paymentLoading,
    paymentError,
    paymentSuccess,
    
    // 초기화 함수
    initializeSubscription,
    loadBillingHistory,
    
    // 플랜 선택 관리
    togglePlanSelection,
    setPlans,
    clearPlans,
    changeBillingCycle,
    
    // 할인 코드
    applyDiscountCode,
    removeDiscountCode,
    
    // 구독 관리
    subscribe,
    cancelMySubscription,
    pauseMySubscription,
    resumeMySubscription,
    updatePayment,
    
    // 청구서
    downloadBill,
    
    // 상태 확인
    hasSubscription,
    getSubscriptionByProduct,
    getSubscriptionStatus,
    getUsageInfo,
    
    // UI 제어
    setStep,
    showCancelDialog,
    hideCancelDialog,
    clearSubscriptionErrors,
    resetPayment,
    
    // 유틸리티
    isSubscribed: (productId) => hasSubscription(productId),
    canUseProduct: (productId) => hasSubscription(productId),
    getProductInfo: (productId) => getProductById(productId),
    isBundle: () => selectedPlans.length > 1,
    hasActivePayment: () => activeSubscriptions.length > 0
  };
};

export default useSubscription;