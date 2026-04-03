import express from 'express';
import { bar } from '../apiConfig.js';
import { savedBar, unsavedBar, checkBarStatus } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barSavedRouter = express.Router();

// 新增收藏
barSavedRouter.post(bar.savedBar, authenticate, async (req, res) => {
    try {
        const { barId } = req.body;
        const userId = req.my_jwt?.id;

        if (!barId || !userId) {
            return sendError(res, '必須提供酒吧ID和用戶ID', 400);
        }

        const results = await savedBar(barId, userId);
        sendSuccess(res, results, '收藏酒吧成功');
    } catch (err) {
        sendError(res, '收藏酒吧失敗', 500, err);
    }
});

// 刪除收藏
barSavedRouter.delete(bar.unsavedBar, authenticate, async (req, res) => {
    try {
        const { barId } = req.body;
        const userId = req.my_jwt?.id;

        if (!barId || !userId) {
            return sendError(res, '必須提供酒吧ID和用戶ID', 400);
        }

        const results = await unsavedBar(barId, userId);
        sendSuccess(res, results, '移除收藏酒吧成功');
    } catch (err) {
        sendError(res, '移除收藏酒吧失敗', 500, err);
    }
});

// 判斷是否收藏
barSavedRouter.post(bar.checkBarStatus, async (req, res) => {
    try {
        const { userId, barIds } = req.body;
        if (!userId || !barIds) {
            return sendError(res, '需要提供 userId 和 barIds', 400);
        }
        
        let barIdArray = [];
        if (Array.isArray(barIds)) {
            barIdArray = barIds.map(id => parseInt(id));
        } else if (typeof barIds === 'string') {
            barIdArray = barIds.split(',').map((id) => parseInt(id.trim()));
        } else {
            // 單一數字
            barIdArray = [parseInt(barIds)];
        }

        const results = await checkBarStatus(userId, barIdArray);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barSavedRouter;
