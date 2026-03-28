import express from 'express';
import { trip } from '../apiConfig.js';
import { getMovieWithId } from '../../services/index.js';

const router = express.Router();

router.get(trip.getMovieWithId, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMovieWithId(trip_plan_id);
        if (results && results.length > 0) {
            const formattedResults = results.map((r) => ({
                ...r,
                movie_type: r.booking_movie_type?.movie_type,
            }));
            res.json(formattedResults);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error('Error in getMovieWithId router:', error);
        res.status(500).send('Error fetching data from the database');
    }
});

export default router;
