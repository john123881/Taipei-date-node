import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getSavedList } from '../../services/index.js';

const collectListRouter = express.Router();

// 收藏列表 - 合併 Post, Bar, Movie
collectListRouter.get(account.collectList, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return res.json({ success: false, error: '沒授權', code: 430 });
        }
        const sid = parseInt(req.params.sid) || 0;
        const list = await getSavedList(sid);

        res.json({
            success: true,
            totalRows: list.length,
            rows: list,
        });

    } catch (error) {
        console.error('Collect List Error:', error);
        res.status(500).json({ success: false, error: '伺服器錯誤' });
    }
});

export default collectListRouter;
