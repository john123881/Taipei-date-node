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
    try {
        const results = await getMovieList();
        res.json(results);
    } catch (error) {
        console.error('Error in getMovieList:', error);
        res.status(500).json({ status: false, message: '獲取電影列表失敗' });
    }
});

movieListrouter.get(booking.getIndexMovieList, async (_req, res) => {
    try {
        const results = await getIndexMovieList();
        res.json(results);
    } catch (error) {
        console.error('Error in getIndexMovieList:', error);
        res.status(500).json({ status: false, message: '獲取首頁電影列表失敗' });
    }
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
    try {
        const { userId, movieIds } = req.query;
        if (!userId || !movieIds) {
            return res.status(400).json({
                status: false,
                message: '需要提供 userId 和 movieIds',
            });
        }
        const movieIdArray = movieIds.split(',').map((id) => id.trim());
        const results = await checkMovieStatus(userId, movieIdArray);
        res.json(results);
    } catch (error) {
        console.error('Error in checkMovieStatus:', error);
        res.status(500).json({ status: false, message: '檢查電影狀態失敗' });
    }
});

movieListrouter.get(booking.searchMovies, async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({
                status: false,
                message: '需要提供 searchTerm',
            });
        }

        const results = await searchMovies(searchTerm);
        res.json(results);
    } catch (error) {
        console.error('Error in searchMovies:', error);
        res.status(500).json({ status: false, message: '搜尋電影失敗' });
    }
});

movieListrouter.get(booking.getBookingSystem, async (_req, res) => {
    try {
        const results = await getBookingSystem();
        res.json(results);
    } catch (error) {
        console.error('Error in getBookingSystem:', error);
        res.status(500).json({ status: false, message: '獲取訂票系統資料失敗' });
    }
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
    try {
        const { movieId } = req.params;
        const results = await getMovieDetail(movieId);
        res.json(results);
    } catch (error) {
        console.error('Error in getMovieDetail:', error);
        res.status(500).json({ status: false, message: '獲取電影詳情失敗' });
    }
});

export default movieListrouter;
