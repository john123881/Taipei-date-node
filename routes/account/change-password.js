import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { changePassword as changePasswordService } from '../../services/index.js';

const changePasswordRouter = express.Router();

// 更改密碼API
changePasswordRouter.put(account.changePassword, authenticate, async (req, res) => {
    let output = {
        success: false,
        action: '',
        data: {
            password: '',
            newPassword: '',
            confirmNewPassword: '',
        },
        msg: '',
        error: '',
        code: 0,
    };

    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let { password, newPassword, confirmNewPassword } = req.body;

    if (!password || !newPassword || !confirmNewPassword) {
        output.error = '請填入資訊';
        output.code = 400;
        return res.json(output);
    }

    if (newPassword !== confirmNewPassword) {
        output.error = '新密碼與確認密碼不符';
        output.code = 460;
        return res.json(output);
    }

    if (password.trim() === newPassword.trim()) {
        output.error = '新密碼不可與舊密碼相同';
        output.code = 455;
        return res.json(output);
    }

    try {
        const result = await changePasswordService(req.my_jwt.id, password.trim(), newPassword.trim());
        if (result) {
            output.success = true;
            output.msg = '密碼更改成功';
        } else {
            output.msg = '密碼未更改';
        }
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            output.error = '無此使用者ID';
            output.code = 420;
        } else if (error.message === 'INVALID_PASSWORD') {
            output.error = '舊密碼有誤';
            output.code = 450;
        } else {
            console.error('Change Password Error:', error);
            output.error = '伺服器錯誤';
            output.code = 500;
        }
    }

    res.json(output);
});

export default changePasswordRouter;
