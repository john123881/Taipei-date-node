import express from 'express';
import { bar } from '../apiConfig.js';
import {
    getBarRatingAverage
} from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barRatingAverageRouter = express.Router();

// 獲取指定 bar_id 的平均評分
barRatingAverageRouter.get(bar.getBarRatingAverage, async (req, res) => {
    const { bar_id } = req.params;
    try {
        const averageRating = await getBarRatingAverage(bar_id);
        if (averageRating !== null) {
            sendSuccess(res, { averageRating });
        } else {
            sendError(res, 'No ratings found for this bar.', 404);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barRatingAverageRouter;
