import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getSavedPosts, deleteSavedPost } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { getCollectionSchema, deleteCollectionSchema } from '../../schemas/account.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const collectPostRouter = express.Router();

// 收藏 - 貼文列表
collectPostRouter.get(account.collectPost, authenticate, validate(getCollectionSchema), async (req, res) => {
    try {
        const sid = req.params.sid;
        const page = req.query.page;
        const perPage = 5;

        const { totalRows, totalPages, data } = await getSavedPosts(sid, page, perPage);

        // 處理頁碼跳轉
        if (totalPages > 0 && page > totalPages) {
            const newQuery = { ...req.query, page: totalPages };
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
        console.error('[Route Error] collectPost:', error);
        sendError(res, '獲取收藏貼文列表失敗', 500, error.message);
    }
});

// 收藏 - 刪除貼文
collectPostRouter.delete(account.collectPostDelete, authenticate, validate(deleteCollectionSchema), async (req, res) => {
    try {
        const save_id = req.params.save_id;
        const result = await deleteSavedPost(save_id);

        if (!result) {
            return sendError(res, '沒這篇貼文', 404);
        }

        sendSuccess(res, { action: 'remove' }, '刪除成功');

    } catch (error) {
        console.error('[Route Error] collectPostDelete:', error);
        sendError(res, '刪除收藏貼文失敗', 500, error.message);
    }
});

export default collectPostRouter;
