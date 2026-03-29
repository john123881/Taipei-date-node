import express from 'express';
import {
    getFriendshipsMessages,
    getMessagesByFriendshipId,
    createMessage,
    getLatestMessages,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';
import uploadAWS from '../../utils/upload-aws-imgs.js';
import { date } from '../apiConfig.js';

const router = express.Router();

// 拿取資料庫資料 (分頁)
router.get(date.getFriendshipsMessages, async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const result = await getFriendshipsMessages(page);
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

// 取得單筆資料 API (依照 friendship_id)
router.get(date.getMessagesByFriendshipId, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { friendship_id } = req.params;
        const data = await getMessagesByFriendshipId(friendship_id);
        sendSuccess(res, data || []);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 新增一筆紀錄
router.post(date.createMessage, async (req, res) => {
    try {
        const { friendship_id, sender_id, content } = req.body;
        if (!friendship_id || !sender_id || !content) {
            return sendError(res, '缺少必要欄位', 400);
        }

        const result = await createMessage(friendship_id, sender_id, content);
        sendSuccess(res, result, '訊息已發送');
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 針對登入使用者，找出朋友的最新一筆的訊息
router.get(date.getLatestMessages, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { user_id } = req.params;
        const data = await getLatestMessages(user_id);
        sendSuccess(res, data || []);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 聊天室上傳圖片 API
// URL: /date/friendships_message/uploadimg/api
router.post(
    date.uploadImg,
    (req, res, next) => {
        req.uploadFolder = 'chat';
        next();
    },
    uploadAWS.single('file'),
    async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, '沒有上傳圖片', 400);
        }
        sendSuccess(res, { imgUrl: req.file.location }, '圖片上傳成功');
    } catch (error) {
        console.error('Chat image upload error:', error);
        sendError(res, '圖片上傳失敗', 500, error);
    }
});

export default router;
