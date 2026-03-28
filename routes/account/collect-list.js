import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getSavedList } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const collectListRouter = express.Router();

// 收藏列表 - 合併 Post, Bar, Movie
collectListRouter.get(account.collectList, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權', 401);
        }
        const sid = parseInt(req.params.sid) || 0;
        const list = await getSavedList(sid);

        sendSuccess(res, list || [], null, {
            totalRows: (list || []).length,
        });

    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default collectListRouter;
