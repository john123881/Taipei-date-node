import express from 'express';
import { trip } from '../apiConfig.js';
import { editShare } from '../../services/index.js';

const router = express.Router();

router.post(trip.editShare, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await editShare(trip_plan_id);
        if (result) {
            res.send('Trip plan successfully updated.');
        } else {
            res.status(404).send('No trip plan found with the given ID');
        }
    } catch (error) {
        console.error('Error in editShare router:', error);
        res.status(500).send('Error updating data in the database');
    }
});

export default router;
