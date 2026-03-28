import express from 'express';
import { trip } from '../apiConfig.js';
import { editUnshare } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.editUnshare, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await editUnshare(trip_plan_id);
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
