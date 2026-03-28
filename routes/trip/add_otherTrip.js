import express from 'express';
import { trip } from '../apiConfig.js';
import { createOtherContent } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.createOtherContent, async (req, res) => {
    try {
        const { tripPlan, tripDetails } = req.body;
        const result = await createOtherContent(tripPlan, tripDetails);
        sendSuccess(res, result, '建立成功');
    } catch (error) {
        sendError(res, '建立失敗', 500, error);
    }
});

export default router;
