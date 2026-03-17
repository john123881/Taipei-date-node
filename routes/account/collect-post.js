import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getSavedPosts, deleteSavedPost } from '../../services/index.js';

const collectPostRouter = express.Router();

// 收藏 - 貼文列表
collectPostRouter.get(account.collectPost, authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;

        const { totalRows, totalPages, data } = await getSavedPosts(sid, page, perPage);

        if (totalRows === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        // 處理頁碼跳轉
        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            const targetPage = page < 1 ? 1 : totalPages;
            const newQuery = { ...req.query, page: targetPage };
            const qp = new URLSearchParams(newQuery).toString();
            return res.redirect(`${req.originalUrl.split('?')[0]}?${qp}`);
        }

        output.success = true;
        output.data = data;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
            query: req.query,
            output,
        });

    } catch (error) {
        console.error('Collect Post GET Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

// 收藏 - 刪除貼文
collectPostRouter.delete(account.collectPostDelete, authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };
    try {
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const save_id = parseInt(req.params.save_id) || 0;
        const result = await deleteSavedPost(save_id);

        if (!result) {
            output.code = 401;
            output.error = '沒這篇貼文';
            return res.json({ output });
        }

        output.success = true;
        output.action = 'remove';
        res.json({ output });

    } catch (error) {
        console.error('Delete Saved Post Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default collectPostRouter;
