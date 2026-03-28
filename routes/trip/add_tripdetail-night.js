import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentNight } from '../../services/index.js';

const router = express.Router();

router.post(trip.createContentNight, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await createContentNight(trip_plan_id);
        res.status(200).json({
            success: true,
            trip_detail_id: result.trip_detail_id,
            results: result,
        });
    } catch (error) {
        console.error('Error in createContentNight router:', error);
        res.status(500).json({
            success: false,
            error: 'Error adding data to the database',
        });
    }
});

export default router;
