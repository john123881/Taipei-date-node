import express from 'express';
import { trip } from '../apiConfig.js';
import { editAddMovie } from '../../services/index.js';
//新增電影

const router = express.Router();

router.post(trip.editAddMovie, async (req, res) => {
    try {
        const { trip_detail_id, movie_id } = req.body;
        const result = await editAddMovie(trip_detail_id, movie_id);
        if (result) {
            res.json({ message: 'Record updated successfully' });
        } else {
            res.status(404).json({ message: 'No record found with the given ID' });
        }
    } catch (error) {
        console.error('Error in editAddMovie router:', error);
        res.status(500).json({
            message: 'Failed to update the database',
            error: error.message,
        });
    }
});

export default router;
