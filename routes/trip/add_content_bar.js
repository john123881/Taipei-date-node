import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentBar } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.createContentBar, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const { bar_id, block } = req.body;
        const result = await createContentBar(trip_plan_id, bar_id, block);
        sendSuccess(res, result, 'Bar added to trip successfully');
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
});

export default router;
