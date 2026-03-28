import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentNight } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.createContentNight, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await createContentNight(trip_plan_id);
        sendSuccess(res, result);
    } catch (error) {
        sendError(res, 'Error adding data to the database', 500, error);
    }
});

export default router;
