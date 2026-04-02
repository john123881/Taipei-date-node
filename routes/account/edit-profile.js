import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getProfile, updateProfile, getAllTypes } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { sidSchema, editProfileSchema } from '../../schemas/account.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const editProfileRouter = express.Router();

// 編輯-讀取編輯頁面的個人資料API
editProfileRouter.get(account.getEditProfile, authenticate, validate(sidSchema), async (req, res) => {
    const sid = req.params.sid;

    try {
        const responseData = await getProfile(sid);

        if (!responseData) {
            return sendError(res, '沒有該筆資料', 404);
        }

        const { barTypes, movieTypes } = await getAllTypes();

        sendSuccess(res, responseData, null, {
            barType: [barTypes],
            movieType: [movieTypes],
        });
    } catch (error) {
        console.error('[Route Error] getEditProfile:', error);
        sendError(res, '伺服器內部錯誤', 500, error.message);
    }
});

// 編輯-編輯個人資料API
editProfileRouter.put(account.editProfile, authenticate, validate(editProfileSchema), async (req, res) => {
    try {
        const sid = req.params.sid;
        const updatedUser = await updateProfile(sid, req.body);

        if (updatedUser) {
            sendSuccess(res, updatedUser, '編輯成功');
        } else {
            sendError(res, '沒有編輯', 400);
        }
    } catch (error) {
        console.error('[Route Error] editProfile:', error);
        sendError(res, '編輯失敗', 500, error.message);
    }
});

export default editProfileRouter;
