import express from 'express';
import { trip } from '../apiConfig.js';
import { getOtherPlans } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError, sendPagination } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getOtherPlans, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }
    const user_id = req.my_jwt.id;
    const { page = 1, limit = 10, keyword = '' } = req.query;

    try {
        const { data, total, totalPages } = await getOtherPlans(user_id, page, limit, keyword);
        sendPagination(res, data, {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages
        });
    } catch (error) {
        sendError(res, 'Error fetching plans', 500, error);
    }
});

export default router;
