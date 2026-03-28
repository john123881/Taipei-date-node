import express from 'express';
import { booking } from '../apiConfig.js';
import { getMovieListType } from '../../services/index.js';

const movieListTypeRouter = express.Router();

movieListTypeRouter.get(booking.getMovieListType, async (req, res) => {
    try {
        const { movie_type_id } = req.params;
        const results = await getMovieListType(movie_type_id);
        res.json(results);
    } catch (error) {
        console.error('Error in getMovieListType:', error);
        res.status(500).json({ status: false, message: '獲取電影類型列表失敗' });
    }
});

export default movieListTypeRouter;
