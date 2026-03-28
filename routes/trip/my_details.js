import express from 'express';
import { trip } from '../apiConfig.js';
import { getMyDetail, getMyTripName } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getMyDetail, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMyDetail(trip_plan_id);
        // 如果是清單，回傳空陣列而非 404
        sendSuccess(res, results || []);
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

router.get(trip.getMyTripName, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await getMyTripName(trip_plan_id);
        if (result) {
            const formattedResult = {
                ...result,
                username: result.member_user?.username,
            };
            delete formattedResult.member_user;
            sendSuccess(res, formattedResult);
        } else {
            sendError(res, 'No data found', 404);
        }
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

export default router;
