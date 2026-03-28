import express from 'express';
import { getBarTypes } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

// 拿取 Bar Type
router.get('/bar_type/api', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const result = await getBarTypes(page);
        // Assuming result might be an array or contain pagination metadata
        if (result && result.data) {
            sendSuccess(res, result.data, null, {
                totalRows: result.totalRows,
                totalPages: result.totalPages,
                page: result.page,
            });
        } else {
            sendSuccess(res, result || []);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default router;
