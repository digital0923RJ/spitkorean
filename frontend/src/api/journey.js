// src/api/journey.js
import apiClient from './index';

/**
 * Korean Journey API
 * 백엔드 routes/journey.py와 정확히 매칭
 */

/**
 * 리딩 콘텐츠 조회
 * GET /api/v1/journey/content?level={level}&type={type}
 * @param {string} level - 레벨 (level1, level2, level3, level4)
 * @param {string} type - 콘텐츠 유형 (hangul, reading, pronunciation, dialogue)
 * @returns {Promise} 리딩 콘텐츠
 */
export const getJourneyContent = async (level = 'level1', type = 'reading') => {
  const response = await apiClient.get(`/journey/content?level=${level}&type=${type}`);
  return response.data;
};

/**
 * 리딩 결과 제출
 * POST /api/v1/journey/submit
 * @param {FormData} formData - 리딩 결과 데이터 (음성 파일 포함)
 * @returns {Promise} 제출 결과
 */
export const submitJourneyReading = async (formData) => {
  const response = await apiClient.post('/journey/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 진행 상황 조회
 * GET /api/v1/journey/progress
 * @returns {Promise} 진행 상황
 */
export const getJourneyProgress = async () => {
  const response = await apiClient.get('/journey/progress');
  return response.data;
};

/**
 * Korean Journey 서비스 사용량 조회
 * GET /api/v1/journey/usage
 * @returns {Promise} 사용량 정보
 */
export const getJourneyUsage = async () => {
  const response = await apiClient.get('/journey/usage');
  return response.data;
};

// 백엔드 응답 구조에 맞는 타입 정의 (참고용)
/**
 * 리딩 콘텐츠 응답 구조
 * {
 *   "status": "success",
 *   "message": "리딩 콘텐츠를 성공적으로 조회했습니다",
 *   "data": {
 *     "content": {
 *       "content_id": "content_object_id",
 *       "title": "콘텐츠 제목",
 *       "description": "콘텐츠 설명",
 *       "level": "level1",
 *       "content_type": "reading",
 *       "content": {
 *         "text": "전체 텍스트",
 *         "sentences": [
 *           {
 *             "id": "sentence_uuid",
 *             "text": "문장 내용"
 *           }
 *         ],
 *         "recommended_speed": 0.5
 *       },
 *       "guide": {
 *         "vocabulary": ["단어1", "단어2"],
 *         "grammar": ["문법1", "문법2"],
 *         "pronunciation": ["발음 팁1", "발음 팁2"],
 *         "cultural_notes": ["문화 설명1", "문화 설명2"]
 *       }
 *     },
 *     "remaining_usage": 15
 *   }
 * }
 */

/**
 * 리딩 결과 제출 응답 구조
 * {
 *   "status": "success",
 *   "message": "리딩 결과가 성공적으로 제출되었습니다",
 *   "data": {
 *     "history_id": "history_object_id",
 *     "pronunciation_score": 85.5,
 *     "reading_speed": 1.2,
 *     "completed_sentences": 8,
 *     "xp_earned": 12
 *   }
 * }
 */

/**
 * 진행 상황 응답 구조
 * {
 *   "status": "success",
 *   "message": "진행 상황을 성공적으로 조회했습니다",
 *   "data": {
 *     "history": [
 *       {
 *         "history_id": "history_object_id",
 *         "content_id": "content_object_id",
 *         "content_title": "콘텐츠 제목",
 *         "level": "level1",
 *         "content_type": "reading",
 *         "reading_speed": 1.2,
 *         "pronunciation_score": 85.5,
 *         "completed_sentences": 8,
 *         "date": "2024-01-01T00:00:00"
 *       }
 *     ],
 *     "level_stats": {
 *       "level1": {
 *         "count": 10,
 *         "average_pronunciation": 78.5,
 *         "average_sentences": 6.2
 *       }
 *     },
 *     "date_stats": [
 *       {
 *         "date": "2024-01-01",
 *         "count": 3,
 *         "total_sentences": 24
 *       }
 *     ],
 *     "total_readings": 25,
 *     "total_sentences": 150,
 *     "avg_pronunciation": 82.3
 *   }
 * }
 */

/**
 * 사용량 응답 구조
 * {
 *   "status": "success",
 *   "message": "사용량 정보를 성공적으로 조회했습니다",
 *   "data": {
 *     "product": "journey",
 *     "has_subscription": true,
 *     "daily_limit": 20,
 *     "remaining": 12,
 *     "reset_at": "2024-01-02T00:00:00"
 *   }
 * }
 */