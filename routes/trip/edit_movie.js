import express from 'express';
import { trip } from '../apiConfig.js';
import { editAddMovie } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.editAddMovie, async (req, res) => {
    try {
        const { trip_detail_id, movie_id } = req.body;
        const result = await editAddMovie(trip_detail_id, movie_id);
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
