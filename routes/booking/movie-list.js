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
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const movieListrouter = express.Router();

movieListrouter.get(booking.getMovieList, async (_req, res) => {
    try {
        const results = await getMovieList();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '獲取電影列表失敗', 500, error);
    }
});

movieListrouter.get(booking.getIndexMovieList, async (_req, res) => {
    try {
        const results = await getIndexMovieList();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '獲取首頁電影列表失敗', 500, error);
    }
});

movieListrouter.post(booking.saveMovie, async (req, res) => {
    const { movieId, userId } = req.body;

    if (!movieId || !userId) {
        return sendError(res, '必須提供電影ID和用戶ID', 400);
    }

    try {
        const results = await saveMovie(movieId, userId);
        sendSuccess(res, results, '收藏電影成功');
    } catch (err) {
        sendError(res, '收藏電影失敗', 500, err);
    }
});

movieListrouter.delete(booking.unsaveMovie, async (req, res) => {
    const { movieId, userId } = req.body;

    if (!movieId || !userId) {
        return sendError(res, '必須提供電影ID和用戶ID', 400);
    }

    try {
        const results = await unsaveMovie(movieId, userId);
        sendSuccess(res, results, '移除收藏電影成功');
    } catch (err) {
        sendError(res, '移除收藏電影失敗', 500, err);
    }
});

movieListrouter.get(booking.checkMovieStatus, async (req, res) => {
    try {
        const { userId, movieIds } = req.query;
        if (!userId || !movieIds) {
            return sendError(res, '需要提供 userId 和 movieIds', 400);
        }
        const movieIdArray = movieIds.split(',').map((id) => id.trim());
        const results = await checkMovieStatus(userId, movieIdArray);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '檢查電影狀態失敗', 500, error);
    }
});

movieListrouter.get(booking.searchMovies, async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return sendError(res, '需要提供 searchTerm', 400);
        }

        const results = await searchMovies(searchTerm);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '搜尋電影失敗', 500, error);
    }
});

movieListrouter.get(booking.getBookingSystem, async (_req, res) => {
    try {
        const results = await getBookingSystem();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '獲取訂票系統資料失敗', 500, error);
    }
});

movieListrouter.delete(booking.deleteMovieBooking, async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return sendError(res, '必須提供 bookingId', 400);
    }

    try {
        const results = await deleteMovieBooking(bookingId);
        sendSuccess(res, results, '移除電影訂位成功');
    } catch (err) {
        sendError(res, '移除電影訂位失敗', 500, err);
    }
});

movieListrouter.get(booking.getMovieDetail, async (req, res) => {
    try {
        const { movieId } = req.params;
        const results = await getMovieDetail(movieId);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '獲取電影詳情失敗', 500, error);
    }
});

export default movieListrouter;
