import express from 'express';
import {
    getFriendshipsMessages,
    getMessagesByFriendshipId,
    createMessage,
    getLatestMessages,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

// 拿取資料庫資料 (分頁)
router.get('/friendships_message/api', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const data = await getFriendshipsMessages(page);
        res.json(data);
    } catch (error) {
        console.error('getFriendshipsMessages error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 取得單筆資料 API (依照 friendship_id)
router.get('/friendships_message/:friendship_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { friendship_id } = req.params;
        const data = await getMessagesByFriendshipId(friendship_id);
        
        if (!data || data.length === 0) {
            return res.json({ success: false, msg: '沒有該筆資料' });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('getMessagesByFriendshipId error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 新增一筆紀錄
router.post('/friendships_message/api', async (req, res) => {
    try {
        const { friendship_id, sender_id, content } = req.body;
        if (!friendship_id || !sender_id || !content) {
            return res.status(400).json({ status: false, message: '缺少必要欄位' });
        }

        const result = await createMessage(friendship_id, sender_id, content);
        res.json({
            success: true,
            friendship_id: result.friendship_id,
            sender_id: result.sender_id,
            content: result.content,
            sended_at: result.sended_at,
        });
    } catch (error) {
        console.error('createMessage error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 針對登入使用者，找出朋友的最新一筆的訊息
router.get('/friendships_message/sender_id/:user_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { user_id } = req.params;
        const data = await getLatestMessages(user_id);
        
        if (!data || data.length === 0) {
            return res.json({ success: false, msg: '沒有該筆資料' });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('getLatestMessages error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
