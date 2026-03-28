import express from 'express';
import {
    getFriendList,
    getFriendshipById,
    createFriendship,
    updateFriendshipStatus,
    getAcceptedFriends,
    getRecommendedFriends,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

// 拿取資料庫資料 (分頁)
router.get('/friends-list/api', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const result = await getFriendList(page);
        if (result && result.data) {
            sendSuccess(res, result.data, null, {
                totalRows: result.totalRows,
                totalPages: result.totalPages,
                page: result.page,
            });
        } else {
            sendSuccess(res, result || []);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 取得單筆資料 API
router.get('/friends-list/:friendship_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { friendship_id } = req.params;
        const data = await getFriendshipById(friendship_id);
        
        if (!data) {
            return sendError(res, '沒有該筆資料', 404);
        }
        sendSuccess(res, data);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 新增一個好友請求
router.post('/friends-list/', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { user_id1, user_id2, friendship_status } = req.body;
        if (!user_id1 || !user_id2) {
            return sendError(res, '缺少必要欄位', 400);
        }

        const result = await createFriendship(user_id1, user_id2, friendship_status);
        sendSuccess(res, result, '好友請求已發送');
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 修改好友狀態 (接受/拒絕)
router.put('/friends-list/edit/:friendship_id', async (req, res) => {
    try {
        const { friendship_id } = req.params;
        const { friendship_status } = req.body;
        const result = await updateFriendshipStatus(friendship_id, friendship_status);
        if (result) {
            sendSuccess(res, result, '狀態更新成功');
        } else {
            sendError(res, '更新失敗，找不到該筆好友關係', 404);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 取得使用者的好友且狀態要是 accepted
router.get('/friends-list/accepted/:user_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { user_id } = req.params;
        const data = await getAcceptedFriends(user_id);
        sendSuccess(res, data || []);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 取得推薦好友 (基於興趣)
router.get('/friends-list/:user_id/:bar_type_id/:movie_type_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { user_id, bar_type_id, movie_type_id } = req.params;
        const data = await getRecommendedFriends(user_id, bar_type_id, movie_type_id);
        sendSuccess(res, data || []);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default router;
