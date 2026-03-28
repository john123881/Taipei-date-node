import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentMovie } from '../../services/index.js';

const router = express.Router();

router.post(trip.createContentMovie, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const { movie_id, block } = req.body;
        const result = await createContentMovie(trip_plan_id, movie_id, block);
        res.status(200).json({
            success: true,
            trip_detail_id: result.trip_detail_id,
            message: 'Movie added to trip successfully',
        });
    } catch (error) {
        console.error('Error in createContentMovie router:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
