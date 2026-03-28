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

const authRouter = express.Router();

// 檢查登入狀態用
authRouter.get('/login-check', authenticate, async (req, res) => {
    const sid = req.query?.sid;
    if (!req.my_jwt?.id) {
        return res.json({ success: false, code: 430, error: '沒授權TOKEN' });
    }
    const jid = req.my_jwt?.id;
    if (jid.toString() !== sid.toString()) {
        return res.json({ success: false, code: 430, error: 'UserID不匹配' });
    }
    
    const user = await prisma.member_user.findUnique({
        where: { user_id: Number(jid) }
    });

    if (!user) {
        return res.json({ result: false, error: '沒有此user_id', msg: '沒有此user_id' });
    }

    return res.json({ success: true, msg: '確認成功，有Token，UserID也符合' });
});

// 登入(JWT)
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, error: '請填寫登入資訊', code: 400 });
    }

    try {
        const result = await loginUser(email, password);
        if (result.success && result.data.token) {
            // 設定 httpOnly Cookie
            res.cookie('token', result.data.token, {
                httpOnly: true,
                secure: true, // Render 使用的是 HTTPS
                sameSite: 'None', // 跨網域連線必備
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3天，與 JWT 過期時間一致
            });
            
            // 為了不影響前端結構，暫時保留 data.token 回傳，但前端應改為不再使用它
            // 或是您可以選擇移除它，強迫前端改用 Cookie
            res.json(result);
        } else {
            res.json(result);
        }
    } catch (error) {
        console.error('Login Error details:', error); // Log full error details
        res.status(500).json({ success: false, error: '伺服器錯誤', details: error.message });
    }
});

// 註冊 - 生成OTP
authRouter.post('/register-send-otp', async (req, res) => {
    const { email } = req.body;
    const schemaEmail = z.string().email({ message: '請填寫正確的電郵格式' });
    const resultEmail = schemaEmail.safeParse(email);

    if (!resultEmail.success) {
        return res.json({ success: false, error: '錯誤 - 請填寫正確的電子郵件格式' });
    }

    try {
        const existingUser = await prisma.member_user.findFirst({ where: { email: email.trim() } });
        if (existingUser) {
            return res.json({ success: false, error: '錯誤 - 此Email已註冊過此電子郵件' });
        }

        const otp = await createOtpForRegister(email);
        if (!otp.token) {
            return res.json({ success: false, error: '錯誤 - 60秒內要求重新產生驗証碼' });
        }

        const mailOptions = {
            from: `"Taipei Date 服務中心"<${process.env.SMTP_TO_EMAIL}>`,
            to: email,
            subject: '註冊要求的電子郵件驗証碼',
            text: `你好，\r\n通知註冊所需要的驗証碼，\r\n請輸入以下的6位數字，註冊頁面的"ValidCode"欄位中。\r\n\r\n驗証碼: ${otp.token}\r\n\r\n請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員。\r\n\r\n敬上\r\nTaipei Date 服務中心`,
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) return res.status(400).json({ success: false, error: '寄信失敗' });
            res.json({ success: true, message: '驗證碼已發送到您的信箱' });
        });
    } catch (error) {
        console.error('Send Register OTP Error:', error);
        res.status(500).json({ success: false, error: '伺服器錯誤' });
    }
});

// 註冊 - 驗證OTP後註冊
authRouter.post('/register', async (req, res) => {
    const { email, validCode, username, password } = req.body;
    if (!email || !validCode || !username || !password) {
        return res.json({ success: false, error: '請填寫註冊資訊', code: 460 });
    }

    try {
        const otpCheck = await verifyOtp(email, validCode);
        if (!otpCheck.success) return res.json(otpCheck);

        const result = await registerUser(username, email, password);
        res.json(result);
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ success: false, error: '註冊時發生錯誤' });
    }
});

// 忘記密碼 - 生成OTP
authRouter.post('/forget-password-send-otp', async (req, res) => {
    const { email } = req.body;
    const schemaEmail = z.string().email({ message: '請填寫正確的電郵格式' });
    const resultEmail = schemaEmail.safeParse(email);

    if (!resultEmail.success) {
        return res.json({ success: false, error: '錯誤 - 請填寫正確的電子郵件格式' });
    }

    try {
        const user = await prisma.member_user.findFirst({ where: { email: email.trim() } });
        if (!user) {
            return res.json({ success: false, error: '錯誤 - 使用者電子郵件不存在' });
        }
        if (user.google_uid !== null) {
            return res.json({ success: false, error: '綁定google登入之電子郵件不適用' });
        }

        const otp = await createOtpForPassword(email, user.user_id);
        if (!otp.token) {
            return res.json({ success: false, error: '錯誤 - 60秒內要求重新產生驗証碼' });
        }

        const mailOptions = {
            from: `"Taipei Date 服務中心"<${process.env.SMTP_TO_EMAIL}>`,
            to: email,
            subject: '重設密碼要求的電子郵件驗証碼',
            text: `你好，\r\n通知重設密碼所需要的驗証碼，\r\n請輸入以下的6位數字，驗証碼欄位中。\r\n\r\n驗証碼: ${otp.token}\r\n\r\n請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員。\r\n\r\n敬上\r\nTaipei Date 服務中心`,
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) return res.status(400).json({ success: false, error: '寄信失敗' });
            res.json({ success: true, message: '驗證碼已發送到您的信箱' });
        });
    } catch (error) {
        console.error('Send Password OTP Error:', error);
        res.status(500).json({ success: false, error: '伺服器錯誤' });
    }
});

// 忘記密碼 - 驗證OTP後修改
authRouter.put('/forget-password-edit', async (req, res) => {
    const { email, validCode, password, confirmPassword } = req.body;
    if (!email || !validCode || !password || !confirmPassword) {
        return res.json({ success: false, error: '缺少必填資料', code: 460 });
    }

    if (password !== confirmPassword) {
        return res.json({ success: false, error: '確認密碼不符' });
    }

    try {
        const otpCheck = await verifyOtp(email, validCode);
        if (!otpCheck.success) return res.json(otpCheck);

        const result = await updatePasswordByOtp(email, password);
        res.json(result);
    } catch (error) {
        console.error('Forget Password Edit Error:', error);
        res.status(500).json({ success: false, error: '修改密碼時發生錯誤' });
    }
});

// Google 登入
authRouter.post('/google-login', async (req, res) => {
    try {
        const result = await googleLogin(req.body);
        if (result.success && result.data.token) {
            res.cookie('token', result.data.token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 3 * 24 * 60 * 60 * 1000,
            });
        }
        res.json(result);
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({ success: false, error: 'Google登入時發生錯誤' });
    }
});

export default authRouter;
// 登出
authRouter.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.json({ success: true, message: '已成功登出' });
});
