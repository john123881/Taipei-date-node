import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getProfile, checkTodayPoints } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { sidSchema } from '../../schemas/account.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const profileRouter = express.Router();

profileRouter.get(account.getProfile, authenticate, validate(sidSchema), async (req, res) => {
    const sid = req.params.sid;

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
        console.error('[Route Error] getProfile:', error);
        sendError(res, '伺服器內部錯誤', 500, error.message);
    }
});

export default profileRouter;
