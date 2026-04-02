import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import * as services from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';
import catchAsync from '../../utils/catch-async.js';

const collectionsRouter = express.Router();

/**
 * 建立獲取收藏列表的處理函數
 * @param {string} serviceName - 服務函數名稱 (如 'getSavedBars')
 */
const createGetHandler = (serviceName) => catchAsync(async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }
    const sid = parseInt(req.params.sid) || 0;
    const page = parseInt(req.query.page) || 1;
    const perPage = 5;

    const { totalRows, totalPages, data } = await services[serviceName](sid, page, perPage);

    // 處理超出頁碼的跳轉
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
});

/**
 * 建立刪除收藏的處理函數
 * @param {string} serviceName - 服務函數名稱 (如 'deleteSavedBar')
 * @param {string} itemLabel - 用於錯誤訊息的標籤 (如 '間酒吧')
 */
const createDeleteHandler = (serviceName, itemLabel) => catchAsync(async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }
    const save_id = parseInt(req.params.save_id) || 0;
    const result = await services[serviceName](save_id);

    if (!result) {
        return sendError(res, `沒這${itemLabel}`, 404);
    }

    sendSuccess(res, { action: 'remove' }, '刪除成功');
});

// --- 酒吧收藏 ---
collectionsRouter.get(account.collectBar, authenticate, createGetHandler('getSavedBars'));
collectionsRouter.delete(account.collectBarDelete, authenticate, createDeleteHandler('deleteSavedBar', '間酒吧'));

// --- 電影收藏 ---
collectionsRouter.get(account.collectMovie, authenticate, createGetHandler('getSavedMovies'));
collectionsRouter.delete(account.collectMovieDelete, authenticate, createDeleteHandler('deleteSavedMovie', '部電影'));

// --- 貼文收藏 ---
collectionsRouter.get(account.collectPost, authenticate, createGetHandler('getSavedPosts'));
collectionsRouter.delete(account.collectPostDelete, authenticate, createDeleteHandler('deleteSavedPost', '篇貼文'));

export default collectionsRouter;
