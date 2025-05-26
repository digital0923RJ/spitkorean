// frontend/src/shared/utils/calculations.js

/**
 * 계산 관련 유틸리티 함수들
 * 수학적 연산, 통계, 점수 계산, 진도율 등
 */

// 기본 수학 함수들
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

export const round = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min;
  return round(value, decimals);
};

// 평균 계산
export const calculateAverage = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  
  const sum = validNumbers.reduce((acc, num) => acc + num, 0);
  return round(sum / validNumbers.length);
};

// 중앙값 계산
export const calculateMedian = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  
  const sorted = [...validNumbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return round((sorted[middle - 1] + sorted[middle]) / 2);
  } else {
    return sorted[middle];
  }
};

// 표준편차 계산
export const calculateStandardDeviation = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  
  const mean = calculateAverage(validNumbers);
  const squaredDifferences = validNumbers.map(num => Math.pow(num - mean, 2));
  const avgSquaredDifference = calculateAverage(squaredDifferences);
  
  return round(Math.sqrt(avgSquaredDifference));
};

// 백분위수 계산
export const calculatePercentile = (numbers, percentile) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  if (percentile < 0 || percentile > 100) return 0;
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  
  const sorted = [...validNumbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Number.isInteger(index)) {
    return sorted[index];
  } else {
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
  }
};

// 점수 계산 함수들

// 정확도 계산
export const calculateAccuracy = (correct, total) => {
  if (!total || total === 0) return 0;
  return round((correct / total) * 100);
};

// 진도율 계산
export const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return clamp(round((completed / total) * 100), 0, 100);
};

// 성취도 계산 (가중평균)
export const calculateAchievement = (scores, weights) => {
  if (!Array.isArray(scores) || !Array.isArray(weights)) return 0;
  if (scores.length !== weights.length) return 0;
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < scores.length; i++) {
    if (typeof scores[i] === 'number' && typeof weights[i] === 'number') {
      totalWeightedScore += scores[i] * weights[i];
      totalWeight += weights[i];
    }
  }
  
  return totalWeight > 0 ? round(totalWeightedScore / totalWeight) : 0;
};

// TOPIK 점수 계산
export const calculateTopikScore = (correctAnswers, totalQuestions) => {
  if (!totalQuestions || totalQuestions === 0) return 0;
  
  const accuracy = correctAnswers / totalQuestions;
  
  // TOPIK 점수는 일반적으로 300점 만점
  const score = accuracy * 300;
  
  return round(score);
};

// 발음 점수 계산 (정확도, 유창성, 속도 고려)
export const calculatePronunciationScore = (accuracy, fluency, speed) => {
  const weights = {
    accuracy: 0.5,    // 정확도 50%
    fluency: 0.3,     // 유창성 30%
    speed: 0.2        // 속도 20%
  };
  
  const weightedScore = (accuracy * weights.accuracy) + 
                       (fluency * weights.fluency) + 
                       (speed * weights.speed);
  
  return round(clamp(weightedScore, 0, 100));
};

// 학습 효율성 계산
export const calculateLearningEfficiency = (timeSpent, tasksCompleted, accuracy) => {
  if (!timeSpent || timeSpent === 0) return 0;
  
  // 시간당 완료 작업 수 × 정확도
  const tasksPerHour = (tasksCompleted / timeSpent) * 60;
  const efficiency = tasksPerHour * (accuracy / 100);
  
  return round(efficiency);
};

// XP (경험치) 계산
export const calculateXP = (baseXP, difficulty, accuracy, timeBonus = 0) => {
  const difficultyMultiplier = {
    'beginner': 1.0,
    'intermediate': 1.5,
    'advanced': 2.0,
    'level1': 1.0,
    'level2': 1.2,
    'level3': 1.5,
    'level4': 2.0
  };
  
  const multiplier = difficultyMultiplier[difficulty] || 1.0;
  const accuracyBonus = Math.max(0, (accuracy - 60) / 40); // 60% 이상부터 보너스
  
  const xp = baseXP * multiplier * (1 + accuracyBonus) + timeBonus;
  
  return Math.floor(xp);
};

// 연속 학습 보너스 계산
export const calculateStreakBonus = (streakDays) => {
  if (streakDays < 7) return 1.0;
  if (streakDays < 30) return 1.1;  // 7일 이상: 10% 보너스
  if (streakDays < 100) return 1.2; // 30일 이상: 20% 보너스
  return 1.3; // 100일 이상: 30% 보너스
};

// 리그 승급 필요 XP 계산
export const calculateLeagueRequirement = (currentLeague) => {
  const requirements = {
    'bronze': 500,
    'silver': 1500,
    'gold': 3000,
    'diamond': null // 최고 등급
  };
  
  return requirements[currentLeague] || 0;
};

// 가격 계산 함수들

// 할인가 계산
export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  const discount = originalPrice * (discountPercent / 100);
  return round(originalPrice - discount);
};

// 번들 가격 계산
export const calculateBundlePrice = (products, bundleDiscount = 0) => {
  const totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);
  
  if (bundleDiscount > 0) {
    return calculateDiscountedPrice(totalPrice, bundleDiscount * 100);
  }
  
  return round(totalPrice);
};

// 월별 비용 계산 (연간 구독 시)
export const calculateMonthlyEquivalent = (annualPrice) => {
  return round(annualPrice / 12);
};

// 절약 금액 계산
export const calculateSavings = (regularPrice, discountedPrice) => {
  return round(regularPrice - discountedPrice);
};

// 절약 비율 계산
export const calculateSavingsPercentage = (regularPrice, discountedPrice) => {
  if (!regularPrice || regularPrice === 0) return 0;
  
  const savings = regularPrice - discountedPrice;
  return round((savings / regularPrice) * 100);
};

// 시간 관련 계산

// 남은 시간 계산 (밀리초)
export const calculateTimeRemaining = (endDate) => {
  const end = new Date(endDate);
  const now = new Date();
  
  return Math.max(0, end.getTime() - now.getTime());
};

// 시간을 일/시/분으로 변환
export const convertMilliseconds = (milliseconds) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

// 학습 시간 통계 계산
export const calculateStudyTimeStats = (sessions) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      totalTime: 0,
      averageTime: 0,
      longestSession: 0,
      shortestSession: 0,
      totalSessions: 0
    };
  }
  
  const durations = sessions.map(session => session.duration || 0);
  
  return {
    totalTime: durations.reduce((sum, duration) => sum + duration, 0),
    averageTime: calculateAverage(durations),
    longestSession: Math.max(...durations),
    shortestSession: Math.min(...durations),
    totalSessions: sessions.length
  };
};

// 성장률 계산
export const calculateGrowthRate = (currentValue, previousValue) => {
  if (!previousValue || previousValue === 0) return 0;
  
  const growth = ((currentValue - previousValue) / previousValue) * 100;
  return round(growth);
};

// 이동평균 계산
export const calculateMovingAverage = (data, windowSize) => {
  if (!Array.isArray(data) || data.length < windowSize) return [];
  
  const result = [];
  
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    result.push(calculateAverage(window));
  }
  
  return result;
};

// 트렌드 분석 (선형 회귀)
export const calculateTrend = (data) => {
  if (!Array.isArray(data) || data.length < 2) return { slope: 0, direction: 'neutral' };
  
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  let direction = 'neutral';
  if (slope > 0.1) direction = 'increasing';
  else if (slope < -0.1) direction = 'decreasing';
  
  return { slope: round(slope, 4), direction };
};

// 목표 달성률 계산
export const calculateGoalProgress = (current, target) => {
  if (!target || target === 0) return 0;
  
  return clamp(round((current / target) * 100), 0, 100);
};

// 예상 완료 시간 계산
export const calculateEstimatedCompletion = (current, target, dailyRate) => {
  if (!dailyRate || dailyRate === 0) return null;
  
  const remaining = Math.max(0, target - current);
  const daysNeeded = Math.ceil(remaining / dailyRate);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);
  
  return {
    daysNeeded,
    completionDate: completionDate.toISOString(),
    remainingItems: remaining
  };
};

// 정규화 (0-1 범위로 변환)
export const normalize = (value, min, max) => {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
};

// 점수를 등급으로 변환
export const scoreToGrade = (score) => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
};

// 통계 요약 생성
export const generateStatsSummary = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      standardDeviation: 0
    };
  }
  
  const validData = data.filter(n => typeof n === 'number' && !isNaN(n));
  
  return {
    count: validData.length,
    sum: validData.reduce((sum, val) => sum + val, 0),
    average: calculateAverage(validData),
    median: calculateMedian(validData),
    min: Math.min(...validData),
    max: Math.max(...validData),
    standardDeviation: calculateStandardDeviation(validData)
  };
};