import express from 'express';
import { trip } from '../apiConfig.js';
import { editShare } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.editShare, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await editShare(trip_plan_id);
        if (result) {
            sendSuccess(res, result, 'Trip plan successfully updated.');
        } else {
            sendError(res, 'No trip plan found with the given ID', 404);
        }
    } catch (error) {
        sendError(res, 'Error updating data in the database', 500, error);
    }
});

export default router;
