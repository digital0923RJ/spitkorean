// src/api/test.js
import apiClient from './index';

/**
 * Test & Study API
 * 백엔드 routes/test.py와 정확히 매칭
 */

/**
 * TOPIK 문제 조회
 * GET /api/v1/test/questions?level={level}&count={count}&type={type}
 * @param {number} level - TOPIK 레벨 (1-6)
 * @param {number} count - 문제 수 (기본값: 10)
 * @param {string} type - 문제 유형 (mixed, vocabulary, grammar, reading, listening, writing)
 * @returns {Promise} 문제 목록
 */
export const getTestQuestions = async (level = 3, count = 10, type = 'mixed') => {
  const response = await apiClient.get(`/test/questions?level=${level}&count=${count}&type=${type}`);
  return response.data;
};

/**
 * 테스트 답안 제출
 * POST /api/v1/test/submit
 * @param {Object} data - 답안 제출 데이터
 * @param {string} data.test_id - 테스트 ID
 * @param {Array} data.answers - 답안 목록
 * @returns {Promise} 채점 결과
 */
export const submitTestAnswers = async (data) => {
  const response = await apiClient.post('/test/submit', data);
  return response.data;
};

/**
 * 테스트 결과 조회
 * GET /api/v1/test/results
 * @returns {Promise} 테스트 결과 목록
 */
export const getTestResults = async () => {
  const response = await apiClient.get('/test/results');
  return response.data;
};

/**
 * Test & Study 서비스 사용량 조회
 * GET /api/v1/test/usage
 * @returns {Promise} 사용량 정보
 */
export const getTestUsage = async () => {
  const response = await apiClient.get('/test/usage');
  return response.data;
};

// 백엔드 응답 구조에 맞는 타입 정의 (참고용)
/**
 * TOPIK 문제 목록 응답 구조
 * {
 *   "status": "success",
 *   "message": "TOPIK 문제를 성공적으로 조회했습니다",
 *   "data": {
 *     "test": {
 *       "test_id": "test_object_id",
 *       "title": "TOPIK 3급 종합 문제",
 *       "level": 3,
 *       "test_type": "mixed",
 *       "questions": [
 *         {
 *           "id": "question_uuid",
 *           "question": "문제 내용",
 *           "options": ["선택지1", "선택지2", "선택지3", "선택지4"]
 *         }
 *       ],
 *       "total_questions": 10
 *     },
 *     "remaining_usage": 12
 *   }
 * }
 */

/**
 * 답안 제출 응답 구조
 * {
 *   "status": "success",
 *   "message": "테스트 답안이 성공적으로 제출되었습니다",
 *   "data": {
 *     "result_id": "result_object_id",
 *     "score": 85.5,
 *     "correct_count": 17,
 *     "total_questions": 20,
 *     "graded_questions": [
 *       {
 *         "question": "문제 내용",
 *         "user_answer": "사용자 답변",
 *         "correct_answer": "정답",
 *         "is_correct": true,
 *         "explanation": "해설"
 *       }
 *     ],
 *     "weaknesses": ["문법 - 연결어미", "어휘 - 고급 단어"],
 *     "xp_earned": 8
 *   }
 * }
 */

/**
 * 테스트 결과 목록 응답 구조
 * {
 *   "status": "success",
 *   "message": "테스트 결과를 성공적으로 조회했습니다",
 *   "data": {
 *     "results": [
 *       {
 *         "result_id": "result_object_id",
 *         "test_type": "mixed",
 *         "level": 3,
 *         "score": 85.5,
 *         "date": "2024-01-01T00:00:00",
 *         "questions_count": 20,
 *         "weaknesses": ["문법 - 연결어미"]
 *       }
 *     ],
 *     "stats": {
 *       "level_stats": [
 *         {
 *           "level": 3,
 *           "average_score": 78.5,
 *           "tests_taken": 15
 *         }
 *       ],
 *       "type_stats": [
 *         {
 *           "type": "grammar",
 *           "average_score": 82.3,
 *           "tests_taken": 8
 *         }
 *       ],
 *       "weaknesses": [
 *         {
 *           "weakness": "문법 - 연결어미",
 *           "count": 12
 *         }
 *       ],
 *       "total_tests": 23,
 *       "average_score": 78.5
 *     }
 *   }
 * }
 */

/**
 * 사용량 응답 구조
 * {
 *   "status": "success",
 *   "message": "사용량 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "product": "test",
 *     "has_subscription": true,
 *     "daily_limit": 20,
 *     "remaining": 12,
 *     "reset_at": "2024-01-02T00:00:00"
 *   }
 * }
 */