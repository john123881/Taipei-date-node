import express from 'express';
import { trip } from '../apiConfig.js';
import { getMovie } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getMovie, async (req, res) => {
    try {
        const results = await getMovie();
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
