import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentMovie } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.createContentMovie, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const { movie_id, block } = req.body;
        const result = await createContentMovie(trip_plan_id, movie_id, block);
        sendSuccess(res, result, 'Movie added to trip successfully');
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
});

export default router;
