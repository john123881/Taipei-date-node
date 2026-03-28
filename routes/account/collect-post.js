import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getSavedPosts, deleteSavedPost } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const collectPostRouter = express.Router();

// 收藏 - 貼文列表
collectPostRouter.get(account.collectPost, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權', 401);
        }
        const sid = parseInt(req.params.sid) || 0;
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;

        const { totalRows, totalPages, data } = await getSavedPosts(sid, page, perPage);

        // 處理頁碼跳轉
        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            const targetPage = page < 1 ? 1 : totalPages;
            const newQuery = { ...req.query, page: targetPage };
            const qp = new URLSearchParams(newQuery).toString();
            return res.redirect(`${req.originalUrl.split('?')[0]}?${qp}`);
        }

        sendSuccess(res, data || [], null, {
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
        });

    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 收藏 - 刪除貼文
collectPostRouter.delete(account.collectPostDelete, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權', 401);
        }
        const save_id = parseInt(req.params.save_id) || 0;
        const result = await deleteSavedPost(save_id);

        if (!result) {
            return sendError(res, '沒這篇貼文', 404);
        }

        sendSuccess(res, { action: 'remove' }, '刪除成功');

    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default collectPostRouter;
