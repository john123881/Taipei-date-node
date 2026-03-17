import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getProfile, checkTodayPoints } from '../../services/index.js';

const profileRouter = express.Router();

// 首頁-讀取個人單筆資料 API
// http://localhost:3001/account/1
profileRouter.get(account.getProfile, authenticate, async (req, res) => {
    const output = {
        success: false,
        action: '',
        error: '',
        code: 0,
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let sid = +req.params.sid || 0;

    try {
        const responseData = await getProfile(sid);

        if (!responseData) {
            output.success = false;
            output.code = 440;
            output.error = '沒有該筆資料';
            return res.json(output);
        }

        const { hasLogin, hasPlay } = await checkTodayPoints(sid);

        res.json({
            success: true,
            data: responseData,
            hasPlay,
            hasLogin,
        });

    } catch (error) {
        console.error('Profile API Error:', error);
        res.status(500).json({ success: false, error: '伺服器內部錯誤' });
    }
});

export default profileRouter;
