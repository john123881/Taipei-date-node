import express from 'express';
import { trip } from '../apiConfig.js';
import { editAddBar } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.editAddBar, async (req, res) => {
    try {
        const { trip_detail_id, bar_id } = req.body;
        const result = await editAddBar(trip_detail_id, bar_id);
        if (result) {
            sendSuccess(res, result, 'Record updated successfully');
        } else {
            sendError(res, 'No record found with the given ID', 404);
        }
    } catch (error) {
        sendError(res, 'Failed to update the database', 500, error);
    }
});

export default router;
