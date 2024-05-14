import express from 'express';
import { booking } from '../apiConfig.js';
import {
    getMovieList,
    getIndexMovieList,
    saveMovie,
    unsaveMovie,
    checkMovieStatus,
    searchMovies,
    getBookingSystem,
    deleteMovieBooking,
    getMovieDetail,
} from '../../services/index.js';

const movieListrouter = express.Router();

movieListrouter.get(booking.getMovieList, async (_req, res) => {
    const results = await getMovieList();
    res.json(results);
});

movieListrouter.get(booking.getIndexMovieList, async (_req, res) => {
    const results = await getIndexMovieList();
    res.json(results);
});

movieListrouter.post(booking.saveMovie, async (req, res) => {
    const { movieId, userId } = req.body;

    if (!movieId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供電影ID和用戶ID',
        });
    }

    try {
        const results = await saveMovie(movieId, userId);
        return res.status(201).json({
            status: true,
            message: '收藏電影成功',
            data: results,
        });
    } catch (err) {
        console.error('收藏電影錯誤:', err);
        res.status(500).json({
            status: false,
            message: '收藏電影失敗',
            error: err.message,
        });
    }
});

movieListrouter.delete(booking.unsaveMovie, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { movieId, userId } = req.body;

    if (!movieId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供電影ID和用戶ID',
        });
    }

    try {
        const results = await unsaveMovie(movieId, userId);
        return res.status(201).json({
            status: true,
            message: '移除收藏電影成功',
            data: results,
        });
    } catch (err) {
        console.error('移除收藏電影錯誤:', err);
        res.status(500).json({
            status: false,
            message: '移除收藏電影失敗',
            error: err.message,
        });
    }
});

movieListrouter.get(booking.checkMovieStatus, async (req, res) => {
    const { userId, movieIds } = req.query;
    if (!userId || !movieIds) {
        return res.status(400).json({
            status: false,
            message: '需要提供 userId 和 movieIds',
        });
    }
    const movieIdArray = movieIds.split(',').map((id) => parseInt(id.trim()));
    const results = await checkMovieStatus(userId, movieIdArray);
    res.json(results);
});

movieListrouter.get(booking.searchMovies, async (req, res) => {
    const { searchTerm } = req.query;

    if (!searchTerm) {
        return res.status(400).json({
            status: false,
            message: '需要提供 searchTerm',
        });
    }

    const results = await searchMovies(searchTerm);
    res.json(results);
});

movieListrouter.get(booking.getBookingSystem, async (_req, res) => {
    const results = await getBookingSystem();
    res.json(results);
});

movieListrouter.delete(booking.deleteMovieBooking, async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).json({
            status: false,
            message: '必須提供 bookingId',
        });
    }

    try {
        const results = await deleteMovieBooking(bookingId);
        return res.status(201).json({
            status: true,
            message: '移除電影訂位成功',
            data: results,
        });
    } catch (err) {
        console.error('移除電影訂位錯誤:', err);
        res.status(500).json({
            status: false,
            message: '移除電影訂位失敗',
            error: err.message,
        });
    }
});

movieListrouter.get(booking.getMovieDetail, async (req, res) => {
    const { movieId } = req.params;
    const results = await getMovieDetail(movieId);
    res.json(results);
});

export default movieListrouter;
