import express from 'express';
import { trip } from '../apiConfig.js';
import { editAddBar } from '../../services/index.js';
//新增酒吧

const router = express.Router();

router.post(trip.editAddBar, async (req, res) => {
    try {
        const { trip_detail_id, bar_id } = req.body;
        const result = await editAddBar(trip_detail_id, bar_id);
        if (result) {
            res.json({ message: 'Record updated successfully' });
        } else {
            res.status(404).json({ message: 'No record found with the given ID' });
        }
    } catch (error) {
        console.error('Error in editAddBar router:', error);
        res.status(500).json({
            message: 'Failed to update the database',
            error: error.message,
        });
    }
});

export default router;
