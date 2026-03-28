import express from 'express';
import { getMovieTypes } from '../../services/index.js';

const router = express.Router();

// 拿取 Movie Type
router.get('/booking_movie_type/api', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const data = await getMovieTypes(page);
        res.json(data);
    } catch (error) {
        console.error('getMovieTypes error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
