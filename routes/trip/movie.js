import express from 'express';
import { trip } from '../apiConfig.js';
import { getMovie } from '../../services/index.js';

const router = express.Router();

router.get(trip.getMovie, async (req, res) => {
    try {
        const results = await getMovie();
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
        console.error('Error in getMovie router:', error);
        res.status(500).send('Error fetching data from the database');
    }
});

export default router;
