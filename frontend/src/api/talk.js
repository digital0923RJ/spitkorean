import apiClient from './index';

/**
 * Talk Like You Mean It API
 * 백엔드 routes/talk.py와 정확히 매칭
 */

/**
 * 대화 메시지 전송
 * POST /api/v1/talk/chat
 * @param {Object} data - 대화 데이터
 * @param {string} data.message - 사용자 메시지
 * @param {string} [data.session_id] - 세션 ID (선택적)
 * @returns {Promise} 응답 데이터
 */
export const sendChatMessage = async (data) => {
  const response = await apiClient.post('/talk/chat', data);
  return response.data;
};

/**
 * 사용자의 대화 세션 목록 조회
 * GET /api/v1/talk/sessions
 * @returns {Promise} 세션 목록
 */
export const getTalkSessions = async () => {
  const response = await apiClient.get('/talk/sessions');
  return response.data;
};

/**
 * 특정 대화 세션 조회
 * GET /api/v1/talk/session/<session_id>
 * @param {string} sessionId - 세션 ID
 * @returns {Promise} 세션 상세 정보
 */
export const getTalkSession = async (sessionId) => {
  const response = await apiClient.get(`/talk/session/${sessionId}`);
  return response.data;
};

/**
 * Talk 서비스 사용량 조회
 * GET /api/v1/talk/usage
 * @returns {Promise} 사용량 정보
 */
export const getTalkUsage = async () => {
  const response = await apiClient.get('/talk/usage');
  return response.data;
};

// 백엔드 응답 구조에 맞는 타입 정의 (참고용)
/**
 * 대화 응답 구조
 * {
 *   "status": "success",
 *   "message": "대화 응답이 생성되었습니다",
 *   "data": {
 *     "response": "AI 응답 텍스트",
 *     "session_id": "uuid",
 *     "emotion": {
 *       "emotion": "happy",
 *       "confidence": 0.8,
 *       "analysis": {...}
 *     }
 *   }
 * }
 */

/**
 * 세션 목록 응답 구조
 * {
 *   "status": "success", 
 *   "message": "세션 목록을 성공적으로 조회했습니다",
 *   "data": {
 *     "sessions": [
 *       {
 *         "id": "session_object_id",
 *         "sessionId": "uuid",
 *         "date": "2024-01-01T00:00:00",
 *         "updated_at": "2024-01-01T00:00:00"
 *       }
 *     ]
 *   }
 * }
 */

/**
 * 세션 상세 응답 구조
 * {
 *   "status": "success",
 *   "message": "세션 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "session_id": "uuid",
 *     "messages": [
 *       {
 *         "role": "user|assistant",
 *         "content": "메시지 내용",
 *         "timestamp": "2024-01-01T00:00:00",
 *         "emotion": {...}
 *       }
 *     ],
 *     "level": "beginner|intermediate|advanced",
 *     "created_at": "2024-01-01T00:00:00",
 *     "updated_at": "2024-01-01T00:00:00"
 *   }
 * }
 */

/**
 * 사용량 응답 구조  
 * {
 *   "status": "success",
 *   "message": "사용량 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "product": "talk",
 *     "daily_limit": 60,
 *     "remaining": 45,
 *     "reset_at": "2024-01-02T00:00:00"
 *   }
 * }
 */