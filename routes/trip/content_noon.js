import express from 'express';
import { trip } from '../apiConfig.js';
import { getContentNoon } from '../../services/index.js';

const router = express.Router();

router.get(trip.getContentNoon, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getContentNoon(trip_plan_id);
        res.json(results);
    } catch (error) {
        console.error('Error in getContentNoon router:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
