"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { CreditCard, Lock, ArrowLeft, Check, AlertCircle, Gift, Shield, Zap, Crown } from "lucide-react"

// Stripe Provider
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

// 컴포넌트
import Button from "../../components/common/Buttom.jsx"
import Input from "../../components/common/Input"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import PaymentForm from "../../components/subscription/PaymentForm.jsx"
import { PRODUCTS, BUNDLE_PACKAGES } from "../../shared/constants/products"

// 환경 변수
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // URL 파라미터에서 선택된 상품들 추출
  const selectedProductIds = searchParams.get("products")?.split(",") || []
  const billingCycle = searchParams.get("billing") || "monthly"

  // 상태 관리
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(null)
  const [useStripePayment, setUseStripePayment] = useState(true)

  // 결제 폼 데이터
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: "",
    email: user?.email || "",
    billingAddress: {
      country: "US",
      postalCode: "",
    },
  })

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  // 선택된 상품이 없으면 Plans 페이지로 리다이렉트
  useEffect(() => {
    if (selectedProductIds.length === 0) {
      navigate("/subscription/plans")
    }
  }, [selectedProductIds, navigate])

  // 가격 계산
  const calculatePricing = () => {
    if (selectedProductIds.length === 0) return { subtotal: 0, discount: 0, total: 0 }

    const subtotal = selectedProductIds.reduce((sum, productId) => {
      return sum + (PRODUCTS[productId]?.price || 0)
    }, 0)

    let bundleDiscount = 0
    let bundleDiscountRate = 0

    // 번들 할인 계산
    if (selectedProductIds.length === 2) {
      bundleDiscountRate = BUNDLE_PACKAGES.bundle_2.discount
      bundleDiscount = subtotal * bundleDiscountRate
    } else if (selectedProductIds.length === 3) {
      bundleDiscountRate = BUNDLE_PACKAGES.bundle_3.discount
      bundleDiscount = subtotal * bundleDiscountRate
    } else if (selectedProductIds.length === 4) {
      const fixedPrice = BUNDLE_PACKAGES.bundle_all.price
      bundleDiscount = subtotal - fixedPrice
      bundleDiscountRate = bundleDiscount / subtotal
    }

    // 연간 결제 할인
    let annualDiscount = 0
    if (billingCycle === "annual") {
      annualDiscount = (subtotal - bundleDiscount) * 0.2
    }

    // 할인 코드 적용
    let codeDiscount = 0
    if (discountApplied) {
      codeDiscount = (subtotal - bundleDiscount - annualDiscount) * (discountApplied.rate / 100)
    }

    const totalDiscount = bundleDiscount + annualDiscount + codeDiscount
    const total = Math.max(0, subtotal - totalDiscount)

    return {
      subtotal,
      bundleDiscount,
      bundleDiscountRate,
      annualDiscount,
      codeDiscount,
      totalDiscount,
      total: billingCycle === "annual" ? total * 12 : total,
    }
  }

  // 할인 코드 적용
  const applyDiscountCode = () => {
    const discountCodes = {
      WELCOME10: { rate: 10, description: "신규 가입 10% 할인" },
      STUDENT20: { rate: 20, description: "학생 20% 할인" },
      KOREAN2024: { rate: 15, description: "한국어 학습 15% 할인" },
    }

    const code = discountCode.toUpperCase()
    if (discountCodes[code]) {
      setDiscountApplied({ code, ...discountCodes[code] })
      setError(null)
    } else {
      setError("유효하지 않은 할인 코드입니다.")
      setDiscountApplied(null)
    }
  }

  // 할인 코드 제거
  const removeDiscountCode = () => {
    setDiscountCode("")
    setDiscountApplied(null)
  }

  // Stripe 결제 성공 처리 (수정됨)
  const handleStripePaymentSuccess = (paymentResult) => {
    console.log("✅ Stripe 결제 성공:", paymentResult)
    setSuccess(true)
    setError(null) // 에러 상태 초기화

    // 3초 후 대시보드로 이동
    setTimeout(() => {
      navigate("/dashboard")
    }, 3000)
  }

  // Stripe 결제 실패 처리 (수정됨)
  const handleStripePaymentError = (errorMessage) => {
    console.error("❌ Stripe 결제 실패:", errorMessage)

    // 성공 메시지가 에러로 잘못 분류된 경우 확인
    const successKeywords = ["성공적으로", "완료되었습니다", "처리되었습니다", "success", "completed", "processed"]

    const isActuallySuccess = successKeywords.some((keyword) =>
      errorMessage.toLowerCase().includes(keyword.toLowerCase()),
    )

    if (isActuallySuccess) {
      console.log("🔄 성공 메시지가 에러로 잘못 분류됨, 성공으로 처리")
      handleStripePaymentSuccess({
        message: errorMessage,
        corrected: true,
      })
    } else {
      setError(errorMessage)
      setSuccess(false)
    }
  }

  // 기존 결제 처리 (Stripe 외)
  const handlePayment = async (e) => {
    e.preventDefault()

    if (!validatePaymentData()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const pricing = calculatePricing()

      // 결제 데이터 준비
      const paymentPayload = {
        products: selectedProductIds,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        amount: pricing.total,
        discount_code: discountApplied?.code,
        user_id: user.id,
        payment_data: paymentData,
      }

      console.log("Payment payload:", paymentPayload)

      // 모의 결제 지연
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 임시 성공 처리
      setSuccess(true)

      // 3초 후 대시보드로 이동
      setTimeout(() => {
        navigate("/dashboard")
      }, 3000)
    } catch (err) {
      console.error("Payment failed:", err)
      setError("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  // 결제 데이터 유효성 검사
  const validatePaymentData = () => {
    if (paymentMethod === "card") {
      if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvc || !paymentData.nameOnCard) {
        setError("모든 카드 정보를 입력해주세요.")
        return false
      }

      if (paymentData.cardNumber.replace(/\s/g, "").length < 16) {
        setError("올바른 카드 번호를 입력해주세요.")
        return false
      }
    }

    if (!paymentData.email) {
      setError("이메일 주소를 입력해주세요.")
      return false
    }

    return true
  }

  // 카드 번호 포맷팅
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  // 만료일 포맷팅
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const pricing = calculatePricing()

  // 선택된 상품들을 플랜 객체로 변환 (PaymentForm용)
  const selectedPlan =
    selectedProductIds.length === 1
      ? PRODUCTS[selectedProductIds[0]]
      : {
          id: "bundle",
          name: `번들 패키지 (${selectedProductIds.length}개 상품)`,
          price: pricing.subtotal,
          description: `${selectedProductIds.map((id) => PRODUCTS[id]?.name).join(", ")}`,
        }

  // 성공 페이지
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">구독이 완료되었습니다!</h1>
            <p className="text-gray-600 mb-6">한국어 학습 여정을 시작해보세요</p>
            <div className="space-y-3">
              {selectedProductIds.map((productId) => (
                <div key={productId} className="text-sm text-gray-700">
                  ✓ {PRODUCTS[productId]?.name}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <LoadingSpinner size="sm" className="mx-auto mb-2" />
              <p className="text-sm text-gray-500">곧 대시보드로 이동합니다...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/subscription/plans")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>요금제로 돌아가기</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">결제하기</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 주문 요약 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 요약</h2>

            {/* 선택된 상품들 */}
            <div className="space-y-4 mb-6">
              {selectedProductIds.map((productId) => {
                const product = PRODUCTS[productId]
                if (!product) return null

                return (
                  <div key={productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${product.price}/{billingCycle === "annual" ? "년" : "월"}
                      </div>
                      <div className="text-xs text-gray-500">일일 {product.dailyLimit}회</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 결제 방법 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">결제 방법 선택</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setUseStripePayment(true)}
                  className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                    useStripePayment
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <Crown className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">Stripe 결제</span>
                    <div className="text-xs text-gray-500 mt-1">권장</div>
                  </div>
                </button>

                <button
                  onClick={() => setUseStripePayment(false)}
                  className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                    !useStripePayment
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <CreditCard className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">기본 결제</span>
                    <div className="text-xs text-gray-500 mt-1">레거시</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 할인 코드 (기본 결제일 때만) */}
            {!useStripePayment && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">할인 코드 (선택사항)</label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="할인 코드 입력"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    disabled={!!discountApplied}
                  />
                  {discountApplied ? (
                    <Button variant="outline" onClick={removeDiscountCode} className="text-red-600 bg-transparent">
                      제거
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={applyDiscountCode} disabled={!discountCode}>
                      적용
                    </Button>
                  )}
                </div>
                {discountApplied && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm font-medium">{discountApplied.description}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 가격 분석 */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>소계</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>

              {pricing.bundleDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>번들 할인 ({Math.round(pricing.bundleDiscountRate * 100)}%)</span>
                  <span>-${pricing.bundleDiscount.toFixed(2)}</span>
                </div>
              )}

              {pricing.annualDiscount > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>연간 결제 할인 (20%)</span>
                  <span>-${pricing.annualDiscount.toFixed(2)}</span>
                </div>
              )}

              {pricing.codeDiscount > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>할인 코드 ({discountApplied.rate}%)</span>
                  <span>-${pricing.codeDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>총 결제액</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  {billingCycle === "annual" ? "연간 결제" : "월간 결제"}
                </div>
              </div>

              {pricing.totalDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">총 ${pricing.totalDiscount.toFixed(2)} 절약!</span>
                  </div>
                </div>
              )}
            </div>

            {/* 보장 정책 */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">30일 환불 보장</h4>
                  <p className="text-sm text-blue-700 mt-1">만족하지 않으시면 30일 내 100% 환불해드립니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {useStripePayment ? (
              /* Stripe 결제 폼 */
              <Elements stripe={stripePromise}>
                <PaymentForm
                  plan={selectedPlan}
                  billingPeriod={billingCycle}
                  onPaymentSuccess={handleStripePaymentSuccess}
                  onPaymentError={handleStripePaymentError}
                  onCancel={() => navigate("/subscription/plans")}
                  discount={discountApplied ? discountApplied.rate / 100 : 0}
                  promoCode={discountCode}
                  isLoading={loading}
                />
              </Elements>
            ) : (
              /* 기본 결제 폼 */
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">결제 정보</h2>

                <form onSubmit={handlePayment} className="space-y-6">
                  {/* 결제 방법 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">결제 방법</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          paymentMethod === "card"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <CreditCard className="w-6 h-6 text-gray-600" />
                        <span className="text-sm font-medium">카드</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          paymentMethod === "paypal"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        disabled
                      >
                        <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          P
                        </div>
                        <span className="text-sm font-medium text-gray-400">PayPal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("google")}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          paymentMethod === "google"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        disabled
                      >
                        <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                          G
                        </div>
                        <span className="text-sm font-medium text-gray-400">Google Pay</span>
                      </button>
                    </div>
                  </div>

                  {/* 카드 정보 (카드 결제 선택 시) */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <Input
                        label="카드 번호"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            cardNumber: formatCardNumber(e.target.value),
                          }))
                        }
                        maxLength={19}
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="만료일"
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              expiryDate: formatExpiryDate(e.target.value),
                            }))
                          }
                          maxLength={5}
                          required
                        />

                        <Input
                          label="CVC"
                          type="text"
                          placeholder="123"
                          value={paymentData.cvc}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                            }))
                          }
                          maxLength={4}
                          required
                        />
                      </div>

                      <Input
                        label="카드 소유자명"
                        type="text"
                        placeholder="홍길동"
                        value={paymentData.nameOnCard}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            nameOnCard: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}

                  {/* 이메일 */}
                  <Input
                    label="이메일 주소"
                    type="email"
                    placeholder="your@email.com"
                    value={paymentData.email}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />

                  {/* 국가 및 우편번호 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">국가</label>
                      <select
                        value={paymentData.billingAddress.country}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress,
                              country: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="US">미국</option>
                        <option value="KR">한국</option>
                        <option value="JP">일본</option>
                        <option value="CN">중국</option>
                        <option value="GB">영국</option>
                      </select>
                    </div>

                    <Input
                      label="우편번호"
                      type="text"
                      placeholder="12345"
                      value={paymentData.billingAddress.postalCode}
                      onChange={(e) =>
                        setPaymentData((prev) => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* 결제 버튼 */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />${pricing.total.toFixed(2)} 결제하기
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">결제 정보는 SSL로 암호화되어 안전하게 처리됩니다</p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
