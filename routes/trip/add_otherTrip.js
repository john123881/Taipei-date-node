import express from 'express';
import { trip } from '../apiConfig.js';
import { createOtherContent } from '../../services/index.js';

const router = express.Router();

router.post(trip.createOtherContent, async (req, res) => {
    try {
        const { tripPlan, tripDetails } = req.body;
        const result = await createOtherContent(tripPlan, tripDetails);
        res.json({ success: true, tripPlanId: result.trip_plan_id });
    } catch (error) {
        console.error('Error in createOtherContent router:', error);
        res.status(500).json({
            error: 'Transaction failed',
            details: error.message,
        });
    }
});

export default router;
