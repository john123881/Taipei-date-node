import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import bcrypt from 'bcryptjs';
import authenticate from '../../middlewares/authenticate.js';

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

    // 做驗證，頭尾去掉空白
    password = password.trim();
    newPassword = newPassword.trim();
    confirmNewPassword = confirmNewPassword.trim();

    try {
        // 1. 取得使用者資料
        const user = await prisma.member_user.findUnique({
            where: { user_id: req.my_jwt.id }
        });

        if (!user) {
            output.error = '無此使用者ID';
            output.code = 420;
            return res.json(output);
        }

        // 2. 判斷舊密碼輸入正確與否
        const result = await bcrypt.compare(password, user.password_hash);
        if (!result) {
            output.error = '舊密碼有誤';
            output.code = 450;
            return res.json(output);
        }

        // 3. 判斷新舊密碼是否一樣
        if (password === newPassword) {
            output.error = '新密碼不可與舊密碼相同';
            output.code = 455;
            return res.json(output);
        }

        // 4. 更新密碼
        if (newPassword === confirmNewPassword) {
            const newPassword_hash = await bcrypt.hash(newPassword, 12);

            const updatedUser = await prisma.member_user.update({
                where: { user_id: req.my_jwt.id },
                data: {
                    password_hash: newPassword_hash,
                    updated_at: new Date()
                }
            });

            if (updatedUser) {
                output.success = true;
                output.result = updatedUser; // 依照原始邏輯可能需要
                output.msg = '密碼更改成功';
            } else {
                output.msg = '密碼未更改';
            }
        } else {
            output.error = '新密碼與確認密碼不符';
            output.code = 460;
            return res.json(output);
        }

    } catch (error) {
        console.error('Change Password Error:', error);
        output.error = '伺服器錯誤';
        output.code = 500;
    }

    res.json(output);
});

export default changePasswordRouter;
