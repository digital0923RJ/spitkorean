import apiClient from './index';

/**
 * Drama Builder API
 * 백엔드 routes/drama.py와 정확히 매칭
 */

/**
 * 드라마 문장 목록 조회
 * GET /api/v1/drama/sentences?level={level}
 * @param {string} level - 레벨 (beginner, intermediate, advanced)
 * @returns {Promise} 문장 목록
 */
export const getDramaSentences = async (level = 'beginner') => {
  const response = await apiClient.get(`/drama/sentences?level=${level}`);
  return response.data;
};

/**
 * 문장 구성 확인
 * POST /api/v1/drama/check
 * @param {Object} data - 문장 체크 데이터
 * @param {string} data.sentence_id - 문장 ID
 * @param {string} data.drama_id - 드라마 ID
 * @param {string} data.user_answer - 사용자 답변
 * @param {string} data.level - 사용자 레벨
 * @returns {Promise} 체크 결과
 */
export const checkSentence = async (data) => {
  const response = await apiClient.post('/drama/check', data);
  return response.data;
};

/**
 * 드라마 진행 상황 조회
 * GET /api/v1/drama/progress
 * @returns {Promise} 진행 상황
 */
export const getDramaProgress = async () => {
  const response = await apiClient.get('/drama/progress');
  return response.data;
};

/**
 * Drama 서비스 사용량 조회
 * GET /api/v1/drama/usage
 * @returns {Promise} 사용량 정보
 */
export const getDramaUsage = async () => {
  const response = await apiClient.get('/drama/usage');
  return response.data;
};

// 백엔드 응답 구조에 맞는 타입 정의 (참고용)
/**
 * 드라마 문장 목록 응답 구조
 * {
 *   "status": "success",
 *   "message": "드라마 문장을 성공적으로 조회했습니다",
 *   "data": {
 *     "sentences": [
 *       {
 *         "id": "sentence_uuid",
 *         "content": "문장 내용",
 *         "translation": "번역",
 *         "grammar_points": [],
 *         "drama_title": "드라마 제목",
 *         "drama_id": "drama_object_id"
 *       }
 *     ],
 *     "level": "beginner",
 *     "total": 5,
 *     "remaining_usage": 15
 *   }
 * }
 */

/**
 * 문장 체크 응답 구조
 * {
 *   "status": "success",
 *   "message": "문장 확인이 완료되었습니다",
 *   "data": {
 *     "is_correct": true,
 *     "correct_sentence": "정답 문장",
 *     "similar_sentences": ["유사 문장1", "유사 문장2", ...],
 *     "grammar_points": [
 *       {
 *         "element": "문법 요소",
 *         "explanation": "설명",
 *         "example": "예시"
 *       }
 *     ],
 *     "xp_earned": 10
 *   }
 * }
 */

/**
 * 진행 상황 응답 구조
 * {
 *   "status": "success",
 *   "message": "진행 상황을 성공적으로 조회했습니다",
 *   "data": {
 *     "progress": [
 *       {
 *         "drama_id": "drama_object_id",
 *         "drama_title": "드라마 제목",
 *         "level": "beginner",
 *         "completed_sentences": 10,
 *         "total_sentences": 15,
 *         "completion_rate": 66.67,
 *         "last_updated": "2024-01-01T00:00:00"
 *       }
 *     ],
 *     "level_stats": {
 *       "beginner": {
 *         "completed": 20,
 *         "total": 30,
 *         "completion_rate": 66.7
 *       },
 *       "intermediate": {
 *         "completed": 15,
 *         "total": 25,
 *         "completion_rate": 60.0
 *       },
 *       "advanced": {
 *         "completed": 10,
 *         "total": 20,
 *         "completion_rate": 50.0
 *       }
 *     },
 *     "total_completed": 45
 *   }
 * }
 */

/**
 * 사용량 응답 구조
 * {
 *   "status": "success",
 *   "message": "사용량 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "product": "drama",
 *     "has_subscription": true,
 *     "daily_limit": 20,
 *     "remaining": 15,
 *     "reset_at": "2024-01-02T00:00:00"
 *   }
 * }
 */