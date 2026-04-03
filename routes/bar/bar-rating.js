import express from "express";
import { bar } from "../apiConfig.js";
import { getBarRating, getBarRatingById, createBarRating } from "../../services/index.js";
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barRatingRouter = express.Router();

// 1. 取得所有酒吧的評分 (靜態路由優先)
barRatingRouter.get('/bar-rating', async (req, res) => {
    try {
        const results = await getBarRating();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '取得評分列表失敗', 500, error);
    }
});

// 2. 取得指定酒吧的評分 (動態參數路由放在後面)
// 使用 bar.getBarRating (/bar-rating/:bar_id)
barRatingRouter.get(bar.getBarRating, async (req, res) => {
    try {
        const { bar_id } = req.params;
        
        // 額外驗證是否為數字
        if (isNaN(Number(bar_id))) {
            return sendSuccess(res, [], '無效的酒吧ID');
        }

        const results = await getBarRatingById(bar_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '取得指定酒吧評分失敗', 500, error);
    }
});

// 3. 新增評分
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