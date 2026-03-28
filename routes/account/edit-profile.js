import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getProfile, updateProfile, getAllTypes } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const editProfileRouter = express.Router();

// 編輯-讀取編輯頁面的個人資料API
editProfileRouter.get(account.getEditProfile, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }

    let sid = +req.params.sid || 0;

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
        sendError(res, '伺服器內部錯誤', 500, error);
    }
});

// 編輯-編輯個人資料API
editProfileRouter.put(account.editProfile, async (req, res) => {
    try {
        let sid = +req.params.sid || 0;
        const updatedUser = await updateProfile(sid, req.body);

        if (updatedUser) {
            sendSuccess(res, updatedUser, '編輯成功');
        } else {
            sendError(res, '沒有編輯', 400);
        }
    } catch (error) {
        sendError(res, '編輯失敗', 500, error);
    }
});

export default editProfileRouter;
