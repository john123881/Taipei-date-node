import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getProfile, checkTodayPoints } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const profileRouter = express.Router();

profileRouter.get(account.getProfile, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }

    let sid = +req.params.sid || 0;

    try {
        const responseData = await getProfile(sid);

        if (!responseData) {
            return sendError(res, '沒有該筆資料', 404);
        }

        const { hasLogin, hasPlay } = await checkTodayPoints(sid);

        sendSuccess(res, responseData, null, {
            hasPlay,
            hasLogin,
        });
    } catch (error) {
        sendError(res, '伺服器內部錯誤', 500, error);
    }
});

export default profileRouter;
