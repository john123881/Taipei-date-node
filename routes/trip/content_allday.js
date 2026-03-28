import express from 'express';
import { trip } from '../apiConfig.js';
import { getAllDayContent } from '../../services/index.js';

const router = express.Router();

router.get(trip.getAllDayContent, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getAllDayContent(trip_plan_id);
        res.json(results);
    } catch (error) {
        console.error('Error in getAllDayContent router:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
