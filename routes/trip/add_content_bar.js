import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentBar } from '../../services/index.js';

const router = express.Router();

router.post(trip.createContentBar, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const { bar_id, block } = req.body;
        const result = await createContentBar(trip_plan_id, bar_id, block);
        res.status(200).json({
            success: true,
            trip_detail_id: result.trip_detail_id,
            message: 'Bar added to trip successfully',
        });
    } catch (error) {
        console.error('Error in createContentBar router:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
