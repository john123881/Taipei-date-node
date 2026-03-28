import express from 'express';
import { trip } from '../apiConfig.js';
import { getOtherPlans } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getOtherPlans, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }
    const user_id = req.my_jwt.id;
    try {
        const results = await getOtherPlans(user_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, 'Error fetching plans', 500, error);
    }
});

export default router;
