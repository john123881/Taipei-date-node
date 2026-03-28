import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { changePassword as changePasswordService } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const changePasswordRouter = express.Router();

// 更改密碼API
changePasswordRouter.put(account.changePassword, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }

    let { password, newPassword, confirmNewPassword } = req.body;

    if (!password || !newPassword || !confirmNewPassword) {
        return sendError(res, '請填入資訊', 400);
    }

    if (newPassword !== confirmNewPassword) {
        return sendError(res, '新密碼與確認密碼不符', 400);
    }

    if (password.trim() === newPassword.trim()) {
        return sendError(res, '新密碼不可與舊密碼相同', 400);
    }

    try {
        const result = await changePasswordService(req.my_jwt.id, password.trim(), newPassword.trim());
        if (result) {
            sendSuccess(res, null, '密碼更改成功');
        } else {
            sendError(res, '密碼未更改', 400);
        }
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            sendError(res, '無此使用者ID', 404);
        } else if (error.message === 'INVALID_PASSWORD') {
            sendError(res, '舊密碼有誤', 400);
        } else {
            sendError(res, '伺服器錯誤', 500, error);
        }
    }
});

export default changePasswordRouter;
