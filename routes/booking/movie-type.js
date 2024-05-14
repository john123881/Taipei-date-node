import express from 'express';
import { booking } from '../apiConfig.js';
import { getMovieListType } from '../../services/index.js';
// import db from '../../utils/mysql2-connect.js';

const movieListTypeRouter = express.Router();

movieListTypeRouter.get(booking.getMovieListType, async (req, res) => {
    const { movie_type_id } = req.params;
    const results = await getMovieListType(movie_type_id);
    res.json(results);
});

movieListTypeRouter.get(booking.getMovieListType, async (_req, res) => {
    const results = await getMovieListType();
    res.json(results);
});

export default movieListTypeRouter;
