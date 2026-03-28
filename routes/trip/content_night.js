import express from 'express';
import { trip } from '../apiConfig.js';
import { getContentNight } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getContentNight, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getContentNight(trip_plan_id);
        sendSuccess(res, results || []);
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
});

export default router;
