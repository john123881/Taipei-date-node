import { sendError } from '../utils/response-handler.js';
import logger from '../utils/logger.js';

/**
 * 404 處理器
 */
export const notFoundHandler = (req, res) => {
    res.status(404).render('404');
};

/**
 * 全域錯誤處理器 (Global Error Handler)
 */
export const globalErrorHandler = (err, req, res, next) => {
    logger.error('[Global Error Handler]', err);

    // 如果回應已經送出，則將錯誤傳交給下一個錯誤處理器（或是 Express 預設處理器）
    if (res.headersSent) {
        return next(err);
    }
    // Zod 驗證錯誤處理
    if (err.name === 'ZodError') {
        return sendError(res, '資料格式驗證失敗', 400, err.errors);
    }
    
    sendError(
        res, 
        err.message || '伺服器發生未預期的錯誤', 
        err.statusCode || 500, 
        err
    );
};
