import express from 'express';
import { booking } from '../apiConfig.js';
import { getMovieListType } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const movieListTypeRouter = express.Router();

movieListTypeRouter.get(booking.getMovieListType, async (req, res) => {
    try {
        const { movie_type_id } = req.params;
        const results = await getMovieListType(movie_type_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '獲獲取電影類型列表失敗', 500, error);
    }
});

export default movieListTypeRouter;
