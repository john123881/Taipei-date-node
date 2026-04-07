import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { changePassword as changePasswordService, getProfile } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const changePasswordRouter = express.Router();

// 更改密碼API
changePasswordRouter.put(account.changePassword, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }

    let { password, newPassword, confirmNewPassword } = req.body;

    // 先取得帳號狀態，檢查是否有舊密碼
    const profile = await getProfile(req.my_jwt.id);
    const hasPassword = !!profile.password_hash_raw; // 這裡我們需要確保 getProfile 能提供或直接查 DB

    // 如果有舊密碼，則目前密碼必填
    if (profile.hasPassword && !password) {
        return sendError(res, '請填入目前密碼', 400);
    }

    if (!newPassword || !confirmNewPassword) {
        return sendError(res, '請填入新密碼與確認碼', 400);
    }

    if (newPassword !== confirmNewPassword) {
        return sendError(res, '新密碼與確認密碼不符', 400);
    }

    // 如果有舊密碼且相同，則報錯
    if (profile.hasPassword && password && password.trim() === newPassword.trim()) {
        return sendError(res, '新密碼不可與舊密碼相同', 400);
    }

    try {
        const result = await changePasswordService(req.my_jwt.id, password ? password.trim() : '', newPassword.trim());
        if (result) {
            sendSuccess(res, null, '密碼設定成功');
        } else {
            sendError(res, '密碼未變動', 400);
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
