import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import bcrypt from 'bcryptjs';
import authenticate from '../../middlewares/authenticate.js';

const changePasswordRouter = express.Router();

// 更改密碼API
changePasswordRouter.put(account.changePassword, authenticate, async (req, res) => {
    let output = {
        success: false,
        action: '', // add, remove
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

    //做驗證，頭尾去掉空白
    password = password.trim();
    newPassword = newPassword.trim();
    confirmNewPassword = confirmNewPassword.trim();

    // 新舊密碼對照確認
    const sql = 'SELECT * FROM member_user WHERE user_id = ? ';
    const [rows] = await db.query(sql, [req.my_jwt.id]);
    if (!rows.length) {
        //rows沒有長度，代表沒此email，輸出420
        output.error = '無此使用者ID';
        output.code = 420;
        return res.json(output);
    }

    //判斷舊密碼輸入正確與否
    const result = await bcrypt.compare(password, rows[0].password_hash);
    if (!result) {
        output.error = '舊密碼有誤';
        output.code = 450;
        return res.json(output);
    }

    //判斷新舊密碼是否一樣
    if (password === newPassword) {
        output.error = '新密碼不可與舊密碼相同';
        output.code = 455;
        return res.json(output);
    }

    // 更新密碼
    if (newPassword === confirmNewPassword) {
        //新密碼生成HASH
        const newPassword_hash = await bcrypt.hash(newPassword, 12);

        const sql2 = `UPDATE member_user SET password_hash = '${newPassword_hash}' WHERE user_id=? `;
        try {
            const [result] = await db.query(sql2, [req.my_jwt.id]);
            // console.log('db.query.result:', [result]);
            output.success = !!result.changedRows;
            if (result.changedRows) {
                output.msg = '密碼更改成功';
            } else {
                output.msg = '密碼未更改';
            }
        } catch (error) {
            console.log('error:', error);
        }
    }

    res.json(output);
});

export default changePasswordRouter;
