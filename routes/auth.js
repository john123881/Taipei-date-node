import express from 'express';
import { z } from 'zod';
import transporter from '../utils/email.js';
import authenticate from '../middlewares/authenticate.js';
import { 
    createOtpForRegister, 
    createOtpForPassword 
} from '../utils/otp_service.js';
import {
    loginUser,
    verifyOtp,
    registerUser,
    updatePasswordByOtp,
    googleLogin
} from '../services/index.js';
import prisma from '../utils/prisma-client.js';
import { sendSuccess, sendError } from '../utils/response-handler.js';
import cacheAsync from '../utils/catch-async.js';

const authRouter = express.Router();

// 檢查登入狀態用
authRouter.get('/login-check', authenticate, cacheAsync(async (req, res) => {
    const sid = req.query?.sid;
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權TOKEN', 401);
    }
    const jid = req.my_jwt?.id;
    if (jid.toString() !== sid?.toString()) {
        return sendError(res, 'UserID不匹配', 403);
    }
    
    const user = await prisma.member_user.findUnique({
        where: { user_id: Number(jid) }
    });

    if (!user) {
        return sendError(res, '沒有此user_id', 404);
    }

    sendSuccess(res, null, '確認成功，有Token，UserID也符合');
}));

// 登入(JWT)
authRouter.post('/login', cacheAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, '請填寫登入資訊', 400);
    }

    const result = await loginUser(email, password);
    if (result.success && result.data.token) {
        res.cookie('token', result.data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        sendSuccess(res, result.data, result.message || '登入成功');
    } else {
        // 將服務層回傳的 error 與 code 傳遞給前端
        sendError(res, result.message || result.error || '登入失敗', 401, null, result.code);
    }
}));

// 註冊 - 生成OTP
authRouter.post('/register-send-otp', cacheAsync(async (req, res) => {
    const { email } = req.body;
    const schemaEmail = z.string().email({ message: '請填寫正確的電郵格式' });
    const resultEmail = schemaEmail.safeParse(email);

    if (!resultEmail.success) {
        return sendError(res, '錯誤 - 請填寫正確的電子郵件格式', 400);
    }

    const existingUser = await prisma.member_user.findFirst({ where: { email: email.trim() } });
    if (existingUser) {
        return sendError(res, '錯誤 - 此Email已註冊過此電子郵件', 400);
    }

    const otp = await createOtpForRegister(email);
    if (!otp.token) {
        return sendError(res, '錯誤 - 60秒內要求重新產生驗証碼', 429);
    }

    const mailOptions = {
        from: `"Taipei Date 服務中心"<${process.env.SMTP_TO_EMAIL}>`,
        to: email,
        subject: '註冊要求的電子郵件驗証碼',
        text: `你好，\r\n通知註冊所需要的驗証碼，\r\n請輸入以下的6位數字，註冊頁面的"ValidCode"欄位中。\r\n\r\n驗証碼: ${otp.token}\r\n\r\n請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員。\r\n\r\n敬上\r\nTaipei Date 服務中心`,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return sendError(res, '寄信失敗', 500, err);
        sendSuccess(res, null, '驗證碼已發送到您的信箱');
    });
}));

// 註冊 - 驗證OTP後註冊
authRouter.post('/register', cacheAsync(async (req, res) => {
    const { email, validCode, username, password } = req.body;
    if (!email || !validCode || !username || !password) {
        return sendError(res, '請填寫註冊資訊', 400);
    }

    const otpCheck = await verifyOtp(email, validCode);
    if (!otpCheck.success) return sendError(res, otpCheck.message || '驗證碼錯誤', 400);

    const result = await registerUser(username, email, password);
    if (result.success) {
        sendSuccess(res, result.data, result.message);
    } else {
        sendError(res, result.message || result.error || '註冊失敗', 400);
    }
}));

// 忘記密碼 - 生成OTP
authRouter.post('/forget-password-send-otp', cacheAsync(async (req, res) => {
    const { email } = req.body;
    const schemaEmail = z.string().email({ message: '請填寫正確的電郵格式' });
    const resultEmail = schemaEmail.safeParse(email);

    if (!resultEmail.success) {
        return sendError(res, '錯誤 - 請填寫正確的電子郵件格式', 400);
    }

    const user = await prisma.member_user.findFirst({ where: { email: email.trim() } });
    if (!user) {
        return sendError(res, '錯誤 - 使用者電子郵件不存在', 404);
    }
    if (user.google_uid !== null) {
        return sendError(res, '綁定google登入之電子郵件不適用', 400);
    }

    const otp = await createOtpForPassword(email, user.user_id);
    if (!otp.token) {
        return sendError(res, '錯誤 - 60秒內要求重新產生驗証碼', 429);
    }

    const mailOptions = {
        from: `"Taipei Date 服務中心"<${process.env.SMTP_TO_EMAIL}>`,
        to: email,
        subject: '重設密碼要求的電子郵件驗証碼',
        text: `你好，\r\n通知重設密碼所需要的驗証碼，\r\n請輸入以下的6位數字，驗証碼欄位中。\r\n\r\n驗証碼: ${otp.token}\r\n\r\n請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員。\r\n\r\n敬上\r\nTaipei Date 服務中心`,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return sendError(res, '寄信失敗', 500, err);
        sendSuccess(res, null, '驗證碼已發送到您的信箱');
    });
}));

// 忘記密碼 - 驗證OTP後修改
authRouter.put('/forget-password-edit', cacheAsync(async (req, res) => {
    const { email, validCode, password, confirmPassword } = req.body;
    if (!email || !validCode || !password || !confirmPassword) {
        return sendError(res, '缺少必填資料', 400);
    }

    if (password !== confirmPassword) {
        return sendError(res, '確認密碼不符', 400);
    }

    const otpCheck = await verifyOtp(email, validCode);
    if (!otpCheck.success) return sendError(res, otpCheck.message || '驗證碼錯誤', 400);

    const result = await updatePasswordByOtp(email, password);
    if (result.success) {
        sendSuccess(res, result.data, result.message);
    } else {
        sendError(res, result.message || result.error || '修改密碼失敗', 400);
    }
}));

// Google 登入
authRouter.post('/google-login', cacheAsync(async (req, res) => {
    const result = await googleLogin(req.body);
    if (result.success && result.data.token) {
        res.cookie('token', result.data.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        sendSuccess(res, result.data, result.message);
    } else {
        sendError(res, result.message || 'Google登入失敗', 401);
    }
}));

// 登出
authRouter.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    sendSuccess(res, null, '已成功登出');
});

export default authRouter;
