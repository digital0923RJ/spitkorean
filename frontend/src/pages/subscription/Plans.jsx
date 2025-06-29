"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { PRODUCTS, BUNDLE_PACKAGES } from "../../shared/constants/products"

const Plans = () => {
  const navigate = useNavigate()
  const authState = useSelector((state) => state.auth)
  const user = authState?.user
  const isAuthenticated = authState?.isAuthenticated || false

  // 상태 관리
  const [selectedProducts, setSelectedProducts] = useState([])
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [showComparison, setShowComparison] = useState(false)
  const [loading] = useState(false)

  // 상품 아이콘 매핑 (usando emojis para evitar dependências)
  const productIcons = {
    talk: "💬",
    drama: "🎭",
    test: "📚",
    journey: "🗺️",
  }

  // 상품 색상 매핑
  const productColors = {
    talk: "blue",
    drama: "purple",
    test: "green",
    journey: "orange",
  }

  // 상품 선택/해제
  const toggleProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // 전체 선택
  const selectAllProducts = () => {
    const allProductIds = Object.keys(PRODUCTS)
    setSelectedProducts(allProductIds)
  }

  // 선택 초기화
  const clearSelection = () => {
    setSelectedProducts([])
  }

  // 가격 계산
  const calculatePrice = () => {
    if (selectedProducts.length === 0) return { original: 0, discounted: 0, discount: 0 }

    const originalPrice = selectedProducts.reduce((total, productId) => {
      return total + (PRODUCTS[productId]?.price || 0)
    }, 0)

    let discountRate = 0
    let discountedPrice = originalPrice

    // 번들 할인 적용
    if (selectedProducts.length === 2) {
      discountRate = BUNDLE_PACKAGES.bundle_2?.discount || 0
    } else if (selectedProducts.length === 3) {
      discountRate = BUNDLE_PACKAGES.bundle_3?.discount || 0
    } else if (selectedProducts.length === 4) {
      discountRate = BUNDLE_PACKAGES.bundle_all?.discount || 0
      discountedPrice = BUNDLE_PACKAGES.bundle_all?.price || originalPrice
    }

    if (selectedProducts.length < 4) {
      discountedPrice = originalPrice * (1 - discountRate)
    }

    // 연간 결제 추가 할인
    if (billingCycle === "annual") {
      discountedPrice *= 0.8
    }

    return {
      original: originalPrice,
      discounted: discountedPrice,
      discount: discountRate,
      annualDiscount: billingCycle === "annual" ? 0.2 : 0,
    }
  }

  // 구독하기
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    if (selectedProducts.length === 0) {
      alert("최소 1개 이상의 상품을 선택해주세요.")
      return
    }

    const query = new URLSearchParams({
      products: selectedProducts.join(","),
      billing: billingCycle,
    })

    navigate(`/subscription/checkout?${query}`)
  }

  // 무료 체험
  const startFreeTrial = (productId) => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    navigate(`/${productId}`)
  }

  const pricing = calculatePrice()
  const hasDiscount = selectedProducts.length >= 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            완벽한 한국어 학습을 위한
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              맞춤형 플랜
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI 기반 개인 맞춤 학습으로 더 빠르고 효과적인 한국어 실력 향상을 경험하세요
          </p>

          {/* 빌링 사이클 선택 */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
              월간 결제
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === "annual" ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === "annual" ? "text-gray-900" : "text-gray-500"}`}>
              연간 결제
            </span>
            {billingCycle === "annual" && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">20% 할인!</span>
            )}
          </div>
        </div>

        {/* 개별 상품 선택 - ESTRUTURA CORRIGIDA */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(PRODUCTS).map(([productId, product]) => {
            const icon = productIcons[productId] || "📱"
            const isSelected = selectedProducts.includes(productId)
            const color = productColors[productId]

            return (
              <div
                key={productId}
                className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? `border-${color}-500 ring-4 ring-${color}-100` : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* 선택 체크 */}
                {isSelected && (
                  <div
                    className={`absolute -top-2 -right-2 w-6 h-6 bg-${color}-500 rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}

                <div className="p-6">
                  {/* 상품 헤더 - ÁREA CLICÁVEL SEPARADA */}
                  <div className="cursor-pointer" onClick={() => toggleProduct(productId)}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 bg-${color}-100 rounded-lg`}>
                        <span className="text-2xl">{icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.tag}</p>
                      </div>
                    </div>

                    {/* 가격 */}
                    <div className="mb-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${billingCycle === "annual" ? Math.round(product.price * 12 * 0.8) : product.price}
                        </span>
                        <span className="text-gray-500">/{billingCycle === "annual" ? "년" : "월"}</span>
                      </div>
                      {billingCycle === "annual" && (
                        <div className="text-sm text-gray-400 line-through">${product.price * 12}/년</div>
                      )}
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                    {/* 주요 기능 */}
                    <div className="space-y-2 mb-6">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-green-500 text-sm">✓</span>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-500">일일 {product.dailyLimit}회 사용</div>
                    </div>
                  </div>

                  {/* 무료 체험 버튼 - SEPARADO DA ÁREA CLICÁVEL */}
                  <button
                    onClick={() => startFreeTrial(productId)}
                    className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    3일 무료 체험
                  </button>

                  {/* 선택 버튼 - BOTÃO SEPARADO PARA SELEÇÃO */}
                  <button
                    onClick={() => toggleProduct(productId)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isSelected
                        ? `bg-${color}-600 text-white hover:bg-${color}-700 focus:ring-${color}-500`
                        : `border border-${color}-300 text-${color}-700 bg-white hover:bg-${color}-50 focus:ring-${color}-500`
                    }`}
                  >
                    {isSelected ? "선택됨" : "선택하기"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 선택된 상품 및 가격 정보 */}
        {selectedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* 선택된 상품들 */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">선택된 상품 ({selectedProducts.length}개)</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((productId) => (
                    <span
                      key={productId}
                      className={`inline-flex items-center space-x-2 px-3 py-1 bg-${productColors[productId]}-100 text-${productColors[productId]}-800 rounded-full text-sm`}
                    >
                      <span>{productIcons[productId]}</span>
                      <span>{PRODUCTS[productId].name}</span>
                    </span>
                  ))}
                </div>

                {/* 빠른 액션 */}
                <div className="flex space-x-4 mt-3">
                  <button onClick={selectAllProducts} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    전체 선택
                  </button>
                  <button onClick={clearSelection} className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    선택 초기화
                  </button>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="lg:text-right">
                {hasDiscount && (
                  <div className="space-y-1 mb-2">
                    <div className="text-sm text-gray-500 line-through">
                      원가: ${pricing.original.toFixed(2)}/{billingCycle === "annual" ? "년" : "월"}
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <span>%</span>
                        <span className="text-sm font-medium">번들 할인 {Math.round(pricing.discount * 100)}%</span>
                      </div>
                    )}
                    {pricing.annualDiscount > 0 && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <span>🎁</span>
                        <span className="text-sm font-medium">
                          연간 할인 {Math.round(pricing.annualDiscount * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-3xl font-bold text-gray-900">
                  ${pricing.discounted.toFixed(2)}
                  <span className="text-lg text-gray-500 font-normal">/{billingCycle === "annual" ? "년" : "월"}</span>
                </div>

                {hasDiscount && (
                  <div className="text-green-600 font-medium">
                    ${(pricing.original - pricing.discounted).toFixed(2)} 절약!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 추천 번들 패키지 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white mb-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-300 text-xl">👑</span>
                <span className="text-yellow-300 font-semibold">인기 추천</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">올인원 패키지</h3>
              <p className="text-purple-100 mb-4">4개 모든 상품을 25% 할인된 가격에 이용하세요</p>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">
                  $
                  {billingCycle === "annual"
                    ? Math.round((BUNDLE_PACKAGES.bundle_all?.price || 75) * 12 * 0.8)
                    : BUNDLE_PACKAGES.bundle_all?.price || 75}
                  <span className="text-lg font-normal">/{billingCycle === "annual" ? "년" : "월"}</span>
                </div>
                <div className="text-purple-200 line-through">
                  $
                  {billingCycle === "annual"
                    ? Object.values(PRODUCTS).reduce((sum, p) => sum + p.price, 0) * 12
                    : Object.values(PRODUCTS).reduce((sum, p) => sum + p.price, 0)}
                  /{billingCycle === "annual" ? "년" : "월"}
                </div>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => {
                  selectAllProducts()
                  setTimeout(() => handleSubscribe(), 100)
                }}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span>올인원 선택하기</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* 구독 버튼 */}
        {selectedProducts.length > 0 && (
          <div className="text-center">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-lg flex items-center space-x-2 mx-auto transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <span>⚡</span>
              )}
              <span>{loading ? "처리중..." : "선택한 상품 구독하기"}</span>
            </button>

            <p className="text-gray-500 text-sm mt-4">3일 무료 체험 • 언제든 취소 가능 • 첫 달 100% 환불 보장</p>
          </div>
        )}

        {/* 상품 비교표 */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mx-auto transition-colors"
            >
              <span>ℹ️</span>
              <span>{showComparison ? "비교표 숨기기" : "상품 상세 비교하기"}</span>
            </button>
          </div>

          {showComparison && (
            <div className="bg-gray-100 p-8 rounded-lg">
              <p className="text-center text-gray-600">상품 비교 기능은 곧 추가될 예정입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Plans
