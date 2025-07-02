// src/store/slices/subscriptionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as subscriptionAPI from '@/api/subscription'
import { 
  SUBSCRIPTION_PLANS,
  BUNDLE_PLANS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PERIODS,
  calculateBundlePrice,
  getSubscriptionPlan,
  getBundlePlan,
  getSubscriptionStatusDisplay
} from '@/shared/constants/subscriptions'
import toast from 'react-hot-toast'


const isSuccessResponse = (response) => {
  // Verifica se é sucesso por status HTTP (200-299) ou por campo status
  const httpSuccess = response.status >= 200 && response.status < 300
  const statusFieldSuccess = response.status === 'success'
  
  return httpSuccess || statusFieldSuccess
}
const isSuccessMessage = (message) => {
  if (!message) return false
  
  const successKeywords = [
    '성공적으로',
    '완료되었습니다', 
    '처리되었습니다',
    'success',
    'completed',
    'processed',
    'successfully'
  ]
  
  return successKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  )
}

// 비동기 액션들
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getSubscriptionPlans()
      
      if (response.status === 'success') {
        toast.success('요금제 정보를 불러왔습니다.')
        return response.data
      }
      
      return rejectWithValue(response.message || '요금제 정보를 불러오는데 실패했습니다.')
    } catch (error) {
      toast.error('요금제 정보를 불러올 수 없습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchMySubscriptions = createAsyncThunk(
  'subscription/fetchMySubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getMySubscriptions()
      
      if (response.status === 'success') {
        const subscriptionCount = response.data.subscriptions?.length || 0
        
        if (subscriptionCount > 0) {
          toast.success(`${subscriptionCount}개의 활성 구독을 확인했습니다.`)
        } else {
          toast('아직 구독 중인 상품이 없습니다.', {
            icon: '📝',
            duration: 3000
          })
        }
        
        return response.data
      }
      
      return rejectWithValue(response.message || '구독 정보를 불러오는데 실패했습니다.')
    } catch (error) {
      toast.error('구독 정보를 불러올 수 없습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchBillingHistory = createAsyncThunk(
  'subscription/fetchBillingHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getBillingHistory()
      
      if (response.status === 'success') {
        const historyCount = response.data.history?.length || 0
        toast.success(`${historyCount}개의 결제 내역을 불러왔습니다.`)
        return response.data
      }
      
      return rejectWithValue(response.message || '결제 내역을 불러오는데 실패했습니다.')
    } catch (error) {
      toast.error('결제 내역을 불러올 수 없습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUsageStats = createAsyncThunk(
  'subscription/fetchUsageStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getUsageStats()
      
      if (response.status === 'success') {
        return response.data
      }
      
      return rejectWithValue(response.message || '사용량 정보를 불러오는데 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createSubscription = createAsyncThunk(
  "subscription/createSubscription",
  async (subscriptionData, { rejectWithValue, getState }) => {
    try {
      console.log("📤 Data sent to createSubscription:", subscriptionData)
      
      toast.loading("Processing subscription...", {
        id: "subscription-process",
        duration: Number.POSITIVE_INFINITY,
      })

      // Check if subscriptionData is valid
      if (!subscriptionData) {
        console.error("❌ subscriptionData is empty or undefined")
        toast.error("Invalid subscription data", {
          id: "subscription-process",
        })
        return rejectWithValue("Subscription data is required")
      }

      // Check required fields
      const hasSelectedPlans = subscriptionData.selectedPlans?.length > 0 || subscriptionData.plan_id
      const hasBillingCycle = subscriptionData.billingCycle || subscriptionData.billing_period

      if (!hasSelectedPlans) {
        console.error("❌ No plan selected")
        toast.error("No plan was selected", {
          id: "subscription-process",
        })
        return rejectWithValue("At least one plan must be selected")
      }

      if (!hasBillingCycle) {
        console.error("❌ Billing cycle not defined")
        toast.error("Billing cycle was not defined", {
          id: "subscription-process",
        })
        return rejectWithValue("Billing cycle is required")
      }

      // Normalize data
      const normalizedData = {
        ...subscriptionData,
        selectedPlans: subscriptionData.selectedPlans || [subscriptionData.plan_id],
        billingCycle: subscriptionData.billingCycle || subscriptionData.billing_period,
      }

      console.log("📋 Normalized data:", normalizedData)
      console.log("🚀 Calling API subscriptionAPI.createSubscription...")
      
      const response = await subscriptionAPI.createSubscription(normalizedData)
      
      console.log("📥 Full API response:", response)
      console.log("📊 Response status:", response?.status)
      console.log("📋 Response data:", response?.data)
      console.log("⚠️ Response message:", response?.message)

      // Check if response exists
      if (!response) {
        console.error("❌ API response is null or undefined")
        toast.error("Server communication error", {
          id: "subscription-process",
        })
        return rejectWithValue("API response is invalid")
      }

      // ✅ FIX: Check success by HTTP status or status field
      const isSuccess = isSuccessResponse(response)
      const hasSuccessMessage = isSuccessMessage(response.message)
      
      console.log("🔍 Success check:", {
        isSuccess,
        hasSuccessMessage,
        httpStatus: typeof response.status === 'number' ? response.status : 'N/A',
        statusField: typeof response.status === 'string' ? response.status : 'N/A'
      })

      // If success by HTTP status (201, 200, etc.) OR status field OR success message
      if (isSuccess || hasSuccessMessage) {
        const { selectedPlans } = getState().subscription
        const planNames = selectedPlans
          .map((planId) => {
            const plan = getSubscriptionPlan(planId)
            return plan ? plan.name : planId
          })
          .join(", ")

        console.log("✅ Subscription created successfully!")
        toast.success(`${planNames} subscription has started successfully! 🎉`, {
          id: "subscription-process",
          duration: 5000,
        })

        // Return response data
        return response.data || response
      }

      // If reached here, not successful
      console.error("❌ Response does not indicate success:", {
        status: response.status,
        message: response.message
      })
      
      const errorMessage = response.message || "Failed to create subscription."
      toast.error(errorMessage, {
        id: "subscription-process",
      })
      
      return rejectWithValue(errorMessage)

    } catch (error) {
      console.error("💥 Error caught in createSubscription:", error)
      console.error("📋 Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      })

      // ✅ FIX: Check if error actually indicates success
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error'
      
      if (isSuccessMessage(errorMessage)) {
        console.log("🔄 Success message detected in error, treating as success")
        
        const { selectedPlans } = getState().subscription
        const planNames = selectedPlans
          .map((planId) => {
            const plan = getSubscriptionPlan(planId)
            return plan ? plan.name : planId
          })
          .join(", ")

        toast.success(`${planNames} subscription has started successfully! 🎉`, {
          id: "subscription-process",
          duration: 5000,
        })

        return error.response?.data || { success: true, message: errorMessage }
      }

      // Check if network error
      if (!error.response) {
        console.error("🌐 Network error - no server response")
        toast.error("Connection error. Please check your internet.", {
          id: "subscription-process",
        })
        return rejectWithValue("Server connection error")
      }

      // Check specific status codes
      if (error.response?.status === 401) {
        console.error("🔐 Authentication error")
        toast.error("Session expired. Please log in again.", {
          id: "subscription-process",
        })
        return rejectWithValue("Unauthorized")
      }

      if (error.response?.status === 400) {
        console.error("📝 Invalid data sent to API")
        toast.error("Invalid data. Please check the information.", {
          id: "subscription-process",
        })
        return rejectWithValue("Invalid data")
      }

      // ✅ FIX: Check if HTTP status indicates success even on "error"
      if (error.response?.status >= 200 && error.response?.status < 300) {
        console.log("🔄 HTTP status indicates success, treating as success")
        
        toast.success("Subscription processed successfully! 🎉", {
          id: "subscription-process",
          duration: 5000,
        })

        return error.response.data || { success: true }
      }

      toast.error("An error occurred while processing payment.", {
        id: "subscription-process",
      })
      
      return rejectWithValue(errorMessage)
    }
  },
)


export const processPayment = createAsyncThunk(
  'subscription/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      toast.loading('결제를 처리하고 있습니다...', { 
        id: 'payment-process',
        duration: Infinity 
      })
      
      const response = await subscriptionAPI.processPayment(paymentData)
      
      if (response.status === 'success') {
        toast.success('결제가 성공적으로 완료되었습니다! 💳', { 
          id: 'payment-process',
          duration: 4000 
        })
        
        return response.data
      }
      
      toast.error(response.message || '결제 처리에 실패했습니다.', { 
        id: 'payment-process' 
      })
      return rejectWithValue(response.message || '결제 처리에 실패했습니다.')
    } catch (error) {
      toast.error('결제 중 오류가 발생했습니다. 다시 시도해주세요.', { 
        id: 'payment-process' 
      })
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (subscriptionId, { rejectWithValue, getState }) => {
    try {
      // 취소 확인 다이얼로그
      const confirmCancel = await new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="text-center">
              <span className="text-lg">⚠️</span>
              <p className="font-medium">구독을 정말 취소하시겠습니까?</p>
              <p className="text-sm text-gray-600">취소 후에도 현재 결제 기간 끝까지 이용 가능합니다.</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                onClick={() => {
                  toast.dismiss(t.id)
                  resolve(true)
                }}
              >
                취소하기
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                onClick={() => {
                  toast.dismiss(t.id)
                  resolve(false)
                }}
              >
                계속 이용
              </button>
            </div>
          </div>
        ), { duration: Infinity })
      })
      
      if (!confirmCancel) {
        return rejectWithValue('사용자가 취소했습니다.')
      }
      
      const response = await subscriptionAPI.cancelSubscription(subscriptionId)
      
      if (response.status === 'success') {
        // 구독 정보 가져오기
        const { mySubscriptions } = getState().subscription
        const subscription = mySubscriptions.find(sub => sub.id === subscriptionId)
        const planName = subscription ? getSubscriptionPlan(subscription.product)?.name || subscription.product : '구독'
        
        toast.success(`${planName} 구독이 취소되었습니다.`, {
          duration: 4000
        })
        
        return response.data
      }
      
      toast.error(response.message || '구독 취소에 실패했습니다.')
      return rejectWithValue(response.message || '구독 취소에 실패했습니다.')
    } catch (error) {
      toast.error('구독 취소 중 오류가 발생했습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const pauseSubscription = createAsyncThunk(
  'subscription/pauseSubscription',
  async (subscriptionId, { rejectWithValue, getState }) => {
    try {
      const response = await subscriptionAPI.pauseSubscription(subscriptionId)
      
      if (response.status === 'success') {
        const { mySubscriptions } = getState().subscription
        const subscription = mySubscriptions.find(sub => sub.id === subscriptionId)
        const planName = subscription ? getSubscriptionPlan(subscription.product)?.name || subscription.product : '구독'
        
        toast.success(`${planName} 구독이 일시정지되었습니다. ⏸️`)
        return response.data
      }
      
      toast.error(response.message || '구독 일시정지에 실패했습니다.')
      return rejectWithValue(response.message || '구독 일시정지에 실패했습니다.')
    } catch (error) {
      toast.error('구독 일시정지 중 오류가 발생했습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const resumeSubscription = createAsyncThunk(
  'subscription/resumeSubscription',
  async (subscriptionId, { rejectWithValue, getState }) => {
    try {
      const response = await subscriptionAPI.resumeSubscription(subscriptionId)
      
      if (response.status === 'success') {
        const { mySubscriptions } = getState().subscription
        const subscription = mySubscriptions.find(sub => sub.id === subscriptionId)
        const planName = subscription ? getSubscriptionPlan(subscription.product)?.name || subscription.product : '구독'
        
        toast.success(`${planName} 구독이 재개되었습니다! ▶️`)
        return response.data
      }
      
      toast.error(response.message || '구독 재개에 실패했습니다.')
      return rejectWithValue(response.message || '구독 재개에 실패했습니다.')
    } catch (error) {
      toast.error('구독 재개 중 오류가 발생했습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updatePaymentMethod = createAsyncThunk(
  'subscription/updatePaymentMethod',
  async ({ subscriptionId, paymentMethodData }, { rejectWithValue }) => {
    try {
      toast.loading('결제 수단을 업데이트하는 중...', { 
        id: 'payment-update',
        duration: Infinity 
      })
      
      const response = await subscriptionAPI.updatePaymentMethod(subscriptionId, paymentMethodData)
      
      if (response.status === 'success') {
        toast.success('결제 수단이 성공적으로 업데이트되었습니다! 💳', { 
          id: 'payment-update' 
        })
        
        return response.data
      }
      
      toast.error(response.message || '결제 수단 업데이트에 실패했습니다.', { 
        id: 'payment-update' 
      })
      return rejectWithValue(response.message || '결제 수단 업데이트에 실패했습니다.')
    } catch (error) {
      toast.error('결제 수단 업데이트 중 오류가 발생했습니다.', { 
        id: 'payment-update' 
      })
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const validateDiscountCode = createAsyncThunk(
  'subscription/validateDiscountCode',
  async (discountCode, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.validateDiscountCode(discountCode)
      
      if (response.status === 'success') {
        const discount = response.data.discount || 0
        const discountAmount = response.data.amount || 0
        
        if (discount > 0) {
          toast.success(`🎉 할인 코드가 적용되었습니다! ${Math.round(discount * 100)}% 할인`)
        } else if (discountAmount > 0) {
          toast.success(`🎉 할인 코드가 적용되었습니다! $${discountAmount} 할인`)
        } else {
          toast.success('할인 코드가 적용되었습니다!')
        }
        
        return response.data
      }
      
      toast.error(response.message || '유효하지 않은 할인 코드입니다.')
      return rejectWithValue(response.message || '유효하지 않은 할인 코드입니다.')
    } catch (error) {
      toast.error('할인 코드를 확인할 수 없습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const downloadInvoice = createAsyncThunk(
  'subscription/downloadInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      toast.loading('영수증을 다운로드하는 중...', { 
        id: 'download-invoice',
        duration: Infinity 
      })
      
      const response = await subscriptionAPI.downloadInvoice(invoiceId)
      
      if (response.status === 'success') {
        // 파일 다운로드 처리
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice_${invoiceId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast.success('영수증이 다운로드되었습니다! 📄', { 
          id: 'download-invoice' 
        })
        
        return response.data
      }
      
      toast.error('영수증 다운로드에 실패했습니다.', { 
        id: 'download-invoice' 
      })
      return rejectWithValue(response.message || '영수증 다운로드에 실패했습니다.')
    } catch (error) {
      toast.error('영수증 다운로드 중 오류가 발생했습니다.', { 
        id: 'download-invoice' 
      })
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const upgradeSubscription = createAsyncThunk(
  'subscription/upgradeSubscription',
  async ({ subscriptionId, newPlanId }, { rejectWithValue, getState }) => {
    try {
      const newPlan = getSubscriptionPlan(newPlanId)
      const planName = newPlan ? newPlan.name : newPlanId
      
      toast.loading(`${planName}으로 업그레이드하는 중...`, { 
        id: 'upgrade-subscription',
        duration: Infinity 
      })
      
      const response = await subscriptionAPI.upgradeSubscription(subscriptionId, newPlanId)
      
      if (response.status === 'success') {
        toast.success(`${planName}으로 성공적으로 업그레이드되었습니다! 🚀`, { 
          id: 'upgrade-subscription',
          duration: 4000 
        })
        
        return response.data
      }
      
      toast.error(response.message || '업그레이드에 실패했습니다.', { 
        id: 'upgrade-subscription' 
      })
      return rejectWithValue(response.message || '업그레이드에 실패했습니다.')
    } catch (error) {
      toast.error('업그레이드 중 오류가 발생했습니다.', { 
        id: 'upgrade-subscription' 
      })
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const applyPromoCode = createAsyncThunk(
  'subscription/applyPromoCode',
  async ({ promoCode, subscriptionId }, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.applyPromoCode(promoCode, subscriptionId)
      
      if (response.status === 'success') {
        const benefit = response.data.benefit || ''
        toast.success(`🎁 프로모션이 적용되었습니다! ${benefit}`)
        return response.data
      }
      
      toast.error(response.message || '유효하지 않은 프로모션 코드입니다.')
      return rejectWithValue(response.message || '유효하지 않은 프로모션 코드입니다.')
    } catch (error) {
      toast.error('프로모션 코드를 확인할 수 없습니다.')
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// 초기 상태
const initialState = {
  // 요금제 관련
  plans: Object.values(SUBSCRIPTION_PLANS),
  bundles: Object.values(BUNDLE_PLANS),
  plansLoading: false,
  plansError: null,

  // 내 구독 관련
  mySubscriptions: [],
  subscriptionsLoading: false,
  subscriptionsError: null,

  // 결제 내역
  billingHistory: [],
  billingLoading: false,
  billingError: null,

  // 사용량 통계
  usageStats: {},
  usageLoading: false,
  usageError: null,

  // 결제 처리
  paymentLoading: false,
  paymentError: null,
  paymentSuccess: false,

  // 할인 코드
  discountCode: null,
  discountLoading: false,
  discountError: null,

  // 프로모션 코드
  promoCode: null,
  promoLoading: false,
  promoError: null,

  // 선택된 요금제 (결제 과정에서 사용)
  selectedPlans: [],
  billingCycle: 'monthly', // monthly, semi_annual, annual, lifetime

  // UI 상태
  showCancelModal: false,
  selectedSubscriptionForCancel: null,
  checkoutStep: 'plans', // plans, payment, confirmation
  showUpgradeModal: false,
  selectedSubscriptionForUpgrade: null,

  // 기타
  lastPaymentDate: null,
  nextBillingDate: null,
  totalMonthlySavings: 0,
}

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // 선택된 요금제 관리
    addSelectedPlan: (state, action) => {
      const planId = action.payload
      if (!state.selectedPlans.includes(planId)) {
        state.selectedPlans.push(planId)
        
        const plan = getSubscriptionPlan(planId)
        const planName = plan ? plan.name : planId
        toast.success(`${planName}이(가) 선택되었습니다.`, {
          duration: 2000
        })
      }
    },
    
    removeSelectedPlan: (state, action) => {
      const planId = action.payload
      const index = state.selectedPlans.indexOf(planId)
      
      if (index > -1) {
        state.selectedPlans.splice(index, 1)
        
        const plan = getSubscriptionPlan(planId)
        const planName = plan ? plan.name : planId
        toast(`${planName}이(가) 선택 해제되었습니다.`, {
          icon: '📝',
          duration: 2000
        })
      }
    },
    
    clearSelectedPlans: (state) => {
      const count = state.selectedPlans.length
      state.selectedPlans = []
      
      if (count > 0) {
        toast('선택된 요금제가 모두 해제되었습니다.', {
          icon: '🔄'
        })
      }
    },
    
    setSelectedPlans: (state, action) => {
      state.selectedPlans = action.payload
    },

    // 결제 주기 변경
    setBillingCycle: (state, action) => {
      const oldCycle = state.billingCycle
      state.billingCycle = action.payload
      
      const cycleNames = {
        monthly: '월간',
        semi_annual: '6개월',
        annual: '연간',
        lifetime: '평생'
      }
      
      if (oldCycle !== action.payload) {
        toast.success(`결제 주기가 ${cycleNames[action.payload]}으로 변경되었습니다.`)
      }
    },

    // 할인 코드 관리
    clearDiscountCode: (state) => {
      if (state.discountCode) {
        toast('할인 코드가 제거되었습니다.', {
          icon: '🗑️'
        })
      }
      state.discountCode = null
      state.discountError = null
    },
    
    setDiscountCode: (state, action) => {
      state.discountCode = action.payload
    },

    // 프로모션 코드 관리
    clearPromoCode: (state) => {
      if (state.promoCode) {
        toast('프로모션 코드가 제거되었습니다.')
      }
      state.promoCode = null
      state.promoError = null
    },

    // UI 상태 관리
    setShowCancelModal: (state, action) => {
      state.showCancelModal = action.payload
    },
    
    setSelectedSubscriptionForCancel: (state, action) => {
      state.selectedSubscriptionForCancel = action.payload
    },
    
    setShowUpgradeModal: (state, action) => {
      state.showUpgradeModal = action.payload
    },
    
    setSelectedSubscriptionForUpgrade: (state, action) => {
      state.selectedSubscriptionForUpgrade = action.payload
    },
    
    setCheckoutStep: (state, action) => {
      const stepNames = {
        plans: '요금제 선택',
        payment: '결제 정보',
        confirmation: '완료'
      }
      
      state.checkoutStep = action.payload
      
      if (stepNames[action.payload]) {
        toast(`단계: ${stepNames[action.payload]}`, {
          icon: '📍',
          duration: 1500
        })
      }
    },

    // 에러 초기화
    clearErrors: (state) => {
      state.plansError = null
      state.subscriptionsError = null
      state.billingError = null
      state.usageError = null
      state.paymentError = null
      state.discountError = null
      state.promoError = null
    },

    // 결제 상태 초기화
    resetPaymentState: (state) => {
      state.paymentLoading = false
      state.paymentError = null
      state.paymentSuccess = false
    },

    // 구독 상태 로컬 업데이트 (최적화)
    updateSubscriptionStatus: (state, action) => {
      const { subscriptionId, status } = action.payload
      const subscription = state.mySubscriptions.find(sub => sub.id === subscriptionId)
      
      if (subscription) {
        const oldStatus = subscription.status
        subscription.status = status
        subscription.updated_at = new Date().toISOString()
        
        if (oldStatus !== status) {
          const statusDisplay = getSubscriptionStatusDisplay(status)
          toast(`구독 상태가 ${statusDisplay.text}(으)로 변경되었습니다.`, {
            icon: statusDisplay.icon
          })
        }
      }
    },

    // 번들 가격 계산 및 업데이트
    updateBundleCalculation: (state) => {
      if (state.selectedPlans.length >= 2) {
        const originalPrice = state.selectedPlans.reduce((sum, planId) => {
          const plan = getSubscriptionPlan(planId)
          return sum + (plan ? plan.price : 0)
        }, 0)
        
        const bundlePrice = calculateBundlePrice(state.selectedPlans)
        const savings = originalPrice - bundlePrice
        
        state.totalMonthlySavings = savings
        
        if (savings > 0) {
          toast(`💰 번들 할인으로 월 $${savings.toFixed(2)} 절약!`, {
            duration: 3000
          })
        }
      } else {
        state.totalMonthlySavings = 0
      }
    },

    // 구독 만료 알림
    checkSubscriptionExpiry: (state) => {
      const now = new Date()
      const warningDays = 7 // 7일 전 알림
      
      state.mySubscriptions.forEach(subscription => {
        if (subscription.end_date && subscription.status === SUBSCRIPTION_STATUS.ACTIVE) {
          const endDate = new Date(subscription.end_date)
          const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
          
          if (daysUntilExpiry <= warningDays && daysUntilExpiry > 0) {
            const plan = getSubscriptionPlan(subscription.product)
            const planName = plan ? plan.name : subscription.product
            
            toast(`⏰ ${planName} 구독이 ${daysUntilExpiry}일 후 만료됩니다.`, {
              duration: 5000,
              icon: '⚠️'
            })
          }
        }
      })
    }
  },
  
  extraReducers: (builder) => {
    builder
      // 요금제 조회
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.plansLoading = true
        state.plansError = null
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.plansLoading = false
        state.plans = action.payload.plans || Object.values(SUBSCRIPTION_PLANS)
        state.bundles = action.payload.bundles || Object.values(BUNDLE_PLANS)
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.plansLoading = false
        state.plansError = action.payload?.message || '요금제를 불러오는데 실패했습니다'
        // 실패 시 로컬 상수 사용
        state.plans = Object.values(SUBSCRIPTION_PLANS)
        state.bundles = Object.values(BUNDLE_PLANS)
      })

      // 내 구독 조회
      .addCase(fetchMySubscriptions.pending, (state) => {
        state.subscriptionsLoading = true
        state.subscriptionsError = null
      })
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.subscriptionsLoading = false
        state.mySubscriptions = action.payload.subscriptions || []
        
        // 만료 알림 체크
        subscriptionSlice.caseReducers.checkSubscriptionExpiry(state)
      })
      .addCase(fetchMySubscriptions.rejected, (state, action) => {
        state.subscriptionsLoading = false
        state.subscriptionsError = action.payload?.message || '구독 정보를 불러오는데 실패했습니다'
      })

      // 결제 내역 조회
      .addCase(fetchBillingHistory.pending, (state) => {
        state.billingLoading = true
        state.billingError = null
      })
      .addCase(fetchBillingHistory.fulfilled, (state, action) => {
        state.billingLoading = false
        state.billingHistory = action.payload.history || []
        
        // 최근 결제일 업데이트
        if (state.billingHistory.length > 0) {
          state.lastPaymentDate = state.billingHistory[0].date
        }
      })
      .addCase(fetchBillingHistory.rejected, (state, action) => {
        state.billingLoading = false
        state.billingError = action.payload?.message || '결제 내역을 불러오는데 실패했습니다'
      })

      // 사용량 통계 조회
      .addCase(fetchUsageStats.pending, (state) => {
        state.usageLoading = true
        state.usageError = null
      })
      .addCase(fetchUsageStats.fulfilled, (state, action) => {
        state.usageLoading = false
        state.usageStats = action.payload || {}
      })
      .addCase(fetchUsageStats.rejected, (state, action) => {
        state.usageLoading = false
        state.usageError = action.payload?.message || '사용량 정보를 불러오는데 실패했습니다'
      })

      // 구독 생성
      .addCase(createSubscription.pending, (state) => {
        state.paymentLoading = true
        state.paymentError = null
        state.paymentSuccess = false
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.paymentLoading = false
        state.paymentSuccess = true
        
        // 새 구독을 목록에 추가
        if (action.payload.subscription) {
          state.mySubscriptions.push(action.payload.subscription)
        }
        
        // 선택된 플랜 초기화
        state.selectedPlans = []
        state.checkoutStep = 'confirmation'
        state.discountCode = null
        state.promoCode = null
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.paymentLoading = false
        state.paymentError = action.payload?.message || '구독 생성에 실패했습니다'
      })

      // 결제 처리
      .addCase(processPayment.pending, (state) => {
        state.paymentLoading = true
        state.paymentError = null
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.paymentLoading = false
        state.paymentSuccess = true
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.paymentLoading = false
        state.paymentError = action.payload?.message || '결제 처리에 실패했습니다'
      })

      // 구독 취소
      .addCase(cancelSubscription.pending, (state) => {
        state.subscriptionsLoading = true
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.subscriptionsLoading = false
        
        // 구독 상태를 로컬에서 업데이트
        const subscriptionId = action.meta.arg
        const subscription = state.mySubscriptions.find(sub => sub.id === subscriptionId)
        if (subscription) {
          subscription.status = SUBSCRIPTION_STATUS.CANCELLED
          subscription.updated_at = new Date().toISOString()
        }
        
        state.showCancelModal = false
        state.selectedSubscriptionForCancel = null
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.subscriptionsLoading = false
        state.subscriptionsError = action.payload?.message || '구독 취소에 실패했습니다'
      })

      // 구독 일시정지
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const subscriptionId = action.meta.arg
        const subscription = state.mySubscriptions.find(sub => sub.id === subscriptionId)
        if (subscription) {
          subscription.status = 'paused'
          subscription.updated_at = new Date().toISOString()
        }
      })

      // 구독 재개
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const subscriptionId = action.meta.arg
        const subscription = state.mySubscriptions.find(sub => sub.id === subscriptionId)
        if (subscription) {
          subscription.status = SUBSCRIPTION_STATUS.ACTIVE
          subscription.updated_at = new Date().toISOString()
        }
      })

      // 할인 코드 검증
      .addCase(validateDiscountCode.pending, (state) => {
        state.discountLoading = true
        state.discountError = null
      })
      .addCase(validateDiscountCode.fulfilled, (state, action) => {
        state.discountLoading = false
        state.discountCode = action.payload
      })
      .addCase(validateDiscountCode.rejected, (state, action) => {
        state.discountLoading = false
        state.discountError = action.payload?.message || '유효하지 않은 할인 코드입니다'
        state.discountCode = null
      })

      // 프로모션 코드 적용
      .addCase(applyPromoCode.pending, (state) => {
        state.promoLoading = true
        state.promoError = null
      })
      .addCase(applyPromoCode.fulfilled, (state, action) => {
        state.promoLoading = false
        state.promoCode = action.payload
      })
      .addCase(applyPromoCode.rejected, (state, action) => {
        state.promoLoading = false
        state.promoError = action.payload?.message || '유효하지 않은 프로모션 코드입니다'
      })
  }
})

// 액션 내보내기
export const {
  addSelectedPlan,
  removeSelectedPlan,
  clearSelectedPlans,
  setSelectedPlans,
  setBillingCycle,
  clearDiscountCode,
  setDiscountCode,
  clearPromoCode,
  setShowCancelModal,
  setSelectedSubscriptionForCancel,
  setShowUpgradeModal,
  setSelectedSubscriptionForUpgrade,
  setCheckoutStep,
  clearErrors,
  resetPaymentState,
  updateSubscriptionStatus,
  updateBundleCalculation,
  checkSubscriptionExpiry,
} = subscriptionSlice.actions

// 기본 셀렉터들
export const selectPlans = (state) => state.subscription.plans
export const selectBundles = (state) => state.subscription.bundles
export const selectMySubscriptions = (state) => state.subscription.mySubscriptions
export const selectBillingHistory = (state) => state.subscription.billingHistory
export const selectUsageStats = (state) => state.subscription.usageStats
export const selectSelectedPlans = (state) => state.subscription.selectedPlans
export const selectBillingCycle = (state) => state.subscription.billingCycle
export const selectDiscountCode = (state) => state.subscription.discountCode
export const selectPromoCode = (state) => state.subscription.promoCode
export const selectPaymentLoading = (state) => state.subscription.paymentLoading
export const selectPaymentError = (state) => state.subscription.paymentError
export const selectPaymentSuccess = (state) => state.subscription.paymentSuccess
export const selectCheckoutStep = (state) => state.subscription.checkoutStep

// 복합 셀렉터들
export const selectActiveSubscriptions = (state) => 
  state.subscription.mySubscriptions.filter(sub => sub.status === SUBSCRIPTION_STATUS.ACTIVE)

export const selectHasActiveSubscription = (productId) => (state) =>
  state.subscription.mySubscriptions.some(sub => 
    sub.product === productId && sub.status === SUBSCRIPTION_STATUS.ACTIVE
  )

export const selectTotalMonthlyCost = (state) => {
  return state.subscription.mySubscriptions
    .filter(sub => sub.status === SUBSCRIPTION_STATUS.ACTIVE)
    .reduce((total, sub) => {
      const monthlyCost = sub.billing_cycle === 'annual' ? sub.amount / 12 : sub.amount
      return total + monthlyCost
    }, 0)
}

export const selectSubscriptionByProduct = (productId) => (state) =>
  state.subscription.mySubscriptions.find(sub => sub.product === productId)

export const selectSelectedPlansDetails = (state) => {
  return state.subscription.selectedPlans.map(planId => {
    const plan = getSubscriptionPlan(planId)
    return plan || { id: planId, name: planId, price: 0 }
  })
}

export const selectBundlePrice = (state) => {
  return calculateBundlePrice(state.subscription.selectedPlans)
}

export const selectDiscountLoading = (state) => state.subscription.discountLoading


export const selectCanApplyBundle = (state) => {
  return state.subscription.selectedPlans.length >= 2
}

export const selectUpcomingRenewals = (state) => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  return state.subscription.mySubscriptions.filter(sub => {
    if (sub.status !== SUBSCRIPTION_STATUS.ACTIVE || !sub.next_billing_date) return false
    
    const nextBilling = new Date(sub.next_billing_date)
    return nextBilling >= now && nextBilling <= thirtyDaysFromNow
  })
}

export const selectSubscriptionSavings = (state) => {
  return state.subscription.mySubscriptions
    .filter(sub => sub.status === SUBSCRIPTION_STATUS.ACTIVE && sub.billing_cycle === 'annual')
    .reduce((total, sub) => {
      const plan = getSubscriptionPlan(sub.product)
      if (plan) {
        const monthlyPrice = plan.price
        const annualDiscount = monthlyPrice * 12 * 0.20 // 20% 연간 할인
        return total + annualDiscount
      }
      return total
    }, 0)
}

// 리듀서 내보내기
export default subscriptionSlice.reducer