import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentMorning } from '../../services/index.js';

const router = express.Router();

router.post(trip.createContentMorning, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await createContentMorning(trip_plan_id);
        res.status(200).json({
            success: true,
            trip_detail_id: result.trip_detail_id,
            results: result,
        });
    } catch (error) {
        console.error('Error in createContentMorning router:', error);
        res.status(500).json({
            success: false,
            error: 'Error adding data to the database',
        });
    }
});

export default router;
