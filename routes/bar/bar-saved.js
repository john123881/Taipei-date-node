import express from 'express';
import { bar } from '../apiConfig.js';
import { savedBar, unsavedBar, checkBarStatus } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';

const barSavedRouter = express.Router();

// 新增收藏
barSavedRouter.post(bar.savedBar, authenticate, async (req, res) => {
    const { barId } = req.body;
    if (!req.my_jwt?.id) {
        return;
    }
    console.log('jwt:', req.my_jwt?.id);
    let userId = req.my_jwt?.id;
    if (!barId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供酒吧ID和用戶ID',
        });
    }

    try {
        const results = await savedBar(barId, userId);
        return res.status(201).json({
            status: true,
            message: '收藏酒吧成功',
            data: results,
        });
    } catch (err) {
        console.error('收藏酒吧錯誤:', err);
        res.status(500).json({
            status: false,
            message: '收藏酒吧失敗',
            error: err.message,
        });
    }
});

// 刪除收藏
barSavedRouter.delete(bar.unsavedBar, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { barId } = req.body;
    if (!req.my_jwt?.id) {
        return;
    }
    console.log('jwt:', req.my_jwt?.id);
    let userId = req.my_jwt?.id;
    if (!barId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供酒吧ID和用戶ID',
        });
    }

    // const { barId, userId } = req.body;

    // if (!barId || !userId) {
    //     return res.status(400).json({
    //         status: false,
    //         message: '必須提供酒吧ID和用戶ID',
    //     });
    // }

    try {
        const results = await unsavedBar(barId, userId);
        return res.status(201).json({
            status: true,
            message: '移除收藏酒吧成功',
            data: results,
        });
    } catch (err) {
        console.error('移除收藏酒吧錯誤:', err);
        res.status(500).json({
            status: false,
            message: '移除收藏酒吧失敗',
            error: err.message,
        });
    }
});

// 判斷是否收藏
barSavedRouter.get(bar.checkBarStatus, async (req, res) => {
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
});

export default barSavedRouter;
