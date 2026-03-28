import express from 'express';
import { bar } from '../apiConfig.js';
import { savedBar, unsavedBar, checkBarStatus } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';

const barSavedRouter = express.Router();

// 新增收藏
barSavedRouter.post(bar.savedBar, authenticate, async (req, res) => {
    try {
        const { barId } = req.body;
        const userId = req.my_jwt?.id;

        if (!barId || !userId) {
            return res.status(400).json({
                status: false,
                message: '必須提供酒吧ID和用戶ID',
            });
        }

        const results = await savedBar(barId, userId);
        return res.status(201).json({
            status: true,
            message: '收藏酒吧成功',
            data: results,
        });
    } catch (err) {
        console.error('savedBar error:', err);
        res.status(500).json({
            status: false,
            message: '收藏酒吧失敗',
            error: err.message,
        });
    }
});

// 刪除收藏
barSavedRouter.delete(bar.unsavedBar, authenticate, async (req, res) => {
    try {
        const { barId } = req.body;
        const userId = req.my_jwt?.id;

        if (!barId || !userId) {
            return res.status(400).json({
                status: false,
                message: '必須提供酒吧ID和用戶ID',
            });
        }

        const results = await unsavedBar(barId, userId);
        return res.status(200).json({
            status: true,
            message: '移除收藏酒吧成功',
            data: results,
        });
    } catch (err) {
        console.error('unsavedBar error:', err);
        res.status(500).json({
            status: false,
            message: '移除收藏酒吧失敗',
            error: err.message,
        });
    }
});

// 判斷是否收藏
barSavedRouter.get(bar.checkBarStatus, async (req, res) => {
    try {
        const { userId, barIds } = req.query;
        if (!userId || !barIds) {
            return res.status(400).json({
                status: false,
                message: '需要提供 userId 和 barIds',
            });
        }
        const barIdArray = barIds.split(',').map((id) => parseInt(id.trim()));
        const results = await checkBarStatus(userId, barIdArray);
        res.json(results);
    } catch (error) {
        console.error('checkBarStatus error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barSavedRouter;
