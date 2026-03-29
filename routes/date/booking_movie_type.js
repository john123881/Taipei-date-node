import express from 'express';
import { getMovieTypes } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

import { date } from '../apiConfig.js';

const router = express.Router();

// 拿取 Movie Type
router.get(date.getBookingMovieType, async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const result = await getMovieTypes(page);
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
