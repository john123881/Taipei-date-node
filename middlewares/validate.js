import { sendError } from '../utils/response-handler.js';

/**
 * Zod 驗證中介軟體
 * @param {import('zod').ZodSchema} schema - Zod 驗證規則
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema) => (req, res, next) => {
    try {
        // 同時驗證 body, query, params
        const validatedData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // 將驗證過且可能經過 transform 的資料回填
        req.body = validatedData.body;
        req.query = validatedData.query;
        req.params = validatedData.params;

        next();
    } catch (error) {
        // 格式化 Zod 錯誤訊息
        const errorMessages = error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
        }));

        return sendError(res, '資料格式驗證失敗', 400, errorMessages);
    }
};
