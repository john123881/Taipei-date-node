import express from "express";
import { bar } from "../apiConfig.js";
import { getBarRating, getBarRatingById, createBarRating } from "../../services/index.js";
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barRatingRouter = express.Router();

barRatingRouter.get(bar.getBarRating, async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarRatingById(bar_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barRatingRouter.get('/bar-rating', async (req, res) => {
    try {
        const results = await getBarRating();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 取得指定酒吧的評分
barRatingRouter.get('/bar-rating/:bar_id', async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarRatingById(bar_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 取得所有酒吧的评分信息
barRatingRouter.get('/bar-ratings', async (req, res) => {
    try {
        const results = await getBarRating();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 新增評分
barRatingRouter.post(bar.createBarRating, authenticate, async (req, res) => {
    const { bar_id, bar_rating_star, user_id } = req.body;

    if (!bar_id || !bar_rating_star || !user_id) {
        return sendError(res, '必須提供酒吧評分和用戶ID', 400);
    }

    try {
        const newRating = await createBarRating(bar_id, bar_rating_star, user_id);
        sendSuccess(res, newRating, '評分新增成功');
    } catch (err) {
        sendError(res, '評分新增失敗', 500, err);
    }
});

export default barRatingRouter;