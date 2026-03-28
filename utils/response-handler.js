/**
 * 統一回應處理器 (Standard Response Handler)
 * 確保所有 API 回傳格式一致，方便前端處理。
 */

/**
 * 成功回應
 * @param {Object} res Express response object
 * @param {any} data 回傳的資料 (Object or Array)
 * @param {string} message 提示訊息
 * @param {Object} extra 額外的擴充欄位
 */
export const sendSuccess = (res, data, message = 'Success', extra = {}) => {
  return res.json({
    success: true,
    data,
    message,
    ...extra
  });
};

/**
 * 失敗回應
 * @param {Object} res Express response object
 * @param {string} message 錯誤訊息
 * @param {number} statusCode HTTP 狀態碼 (預設 500)
 * @param {any} error 原始錯誤資訊 (僅在開發環境回傳)
 */
export const sendError = (res, message = 'Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  // 非正式環境時，回傳詳細錯誤資訊以便除錯
  if (error && process.env.NODE_ENV !== 'production') {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

/**
 * 分頁回應
 * @param {Object} res Express response object
 * @param {Array} data 回傳的資料陣列
 * @param {Object} pagination 分頁資訊 { total, page, limit, totalPages }
 */
export const sendPagination = (res, data, pagination) => {
  return res.json({
    success: true,
    data,
    pagination
  });
};

export default {
  sendSuccess,
  sendError,
  sendPagination
};
