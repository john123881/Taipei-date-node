import express from 'express';
import { updateUserBarType, updateUserMovieType } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';
import { date } from '../apiConfig.js';

const router = express.Router();

// 更改使用者喜愛的Bar類型
router.put(date.editUserBarType, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { user_id } = req.params;
        const { bar_type_name } = req.body;
        
        const result = await updateUserBarType(user_id, bar_type_name);
        sendSuccess(res, result, '編輯成功');
    } catch (error) {
        sendError(res, error.message || '伺服器錯誤', 500, error);
    }
});

// 更改使用者喜愛的Movie類型
router.put(date.editUserMovieType, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權Token', 401);
        }
        const { user_id } = req.params;
        const { movie_type } = req.body;
        
        const result = await updateUserMovieType(user_id, movie_type);
        sendSuccess(res, result, '編輯成功');
    } catch (error) {
        sendError(res, error.message || '伺服器錯誤', 500, error);
    }
});

export default router;
