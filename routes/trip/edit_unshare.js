import express from 'express';
import { trip } from '../apiConfig.js';
import { editUnshare } from '../../services/index.js';

const router = express.Router();

router.post(trip.editUnshare, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await editUnshare(trip_plan_id);
        if (result) {
            res.send('Trip plan successfully updated.');
        } else {
            res.status(404).send('No trip plan found with the given ID');
        }
    } catch (error) {
        console.error('Error in editUnshare router:', error);
        res.status(500).send('Error updating data in the database');
    }
});

export default router;
