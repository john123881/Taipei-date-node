import express from 'express';
import { trip } from '../apiConfig.js';
import { getMovieWithId } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getMovieWithId, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMovieWithId(trip_plan_id);
        const formattedResults = (results || []).map((r) => ({
            ...r,
            movie_type: r.booking_movie_type?.movie_type,
        }));
        sendSuccess(res, formattedResults);
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

export default router;
