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

const router = express.Router();

// 拿取資料庫資料 (分頁)
router.get('/friends-list/api', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const data = await getFriendList(page);
        res.json(data);
    } catch (error) {
        console.error('getFriendList error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 取得單筆資料 API
router.get('/friends-list/:friendship_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { friendship_id } = req.params;
        const data = await getFriendshipById(friendship_id);
        
        if (!data) {
            return res.json({ success: false, msg: '沒有該筆資料' });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('getFriendshipById error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 新增一個好友請求 (確認是否重複)
router.post('/friends-list/', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { user_id1, user_id2, friendship_status } = req.body;
        if (!user_id1 || !user_id2) {
            return res.status(400).json({ status: false, message: '缺少必要欄位' });
        }

        const result = await createFriendship(user_id1, user_id2, friendship_status);
        res.json({ success: true, friendship_id: result.friendship_id, status: result.friendship_status });
    } catch (error) {
        console.error('createFriendship error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 修改好友狀態 (接受/拒絕)
router.put('/friends-list/edit/:friendship_id', async (req, res) => {
    try {
        const { friendship_id } = req.params;
        const { friendship_status } = req.body;
        const result = await updateFriendshipStatus(friendship_id, friendship_status);
        
        res.json({ success: true, friendship_id: result.friendship_id, status: result.friendship_status });
    } catch (error) {
        console.error('updateFriendshipStatus error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 取得使用者的好友且狀態要是 accepted
router.get('/friends-list/accepted/:user_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { user_id } = req.params;
        const data = await getAcceptedFriends(user_id);
        
        if (!data || data.length === 0) {
            return res.json({ success: false, msg: '沒有符合條件的資料' });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('getAcceptedFriends error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 取得推薦好友 (基於興趣)
router.get('/friends-list/:user_id/:bar_type_id/:movie_type_id', authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.status(401).json({ status: false, message: '沒授權' });
        }
        const { user_id, bar_type_id, movie_type_id } = req.params;
        const data = await getRecommendedFriends(user_id, bar_type_id, movie_type_id);
        
        if (!data || data.length === 0) {
            return res.json({ success: false, msg: '沒有符合條件的資料' });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('getRecommendedFriends error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
