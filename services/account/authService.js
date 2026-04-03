import prisma from '../../utils/prisma-client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginUser = async (email, password) => {
    const user = await prisma.member_user.findFirst({
        where: { email: email.trim() }
    });

    if (!user) {
        return { success: false, error: '無相關帳號', code: 420 };
    }

    if (user.google_uid !== null) {
        return { success: false, error: '此電子郵件已使用Google登入註冊過，請更換Google帳號登入' };
    }

    const result = await bcrypt.compare(password.trim(), user.password_hash);
    if (!result) {
        return { success: false, error: '密碼有錯誤', code: 450 };
    }

    const token = jwt.sign(
        { id: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    );

    // 檢查並發放今日登入積分
    const { getPointLogin } = await grantDailyLoginReward(user.user_id);

    return {
        success: true,
        data: {
            id: user.user_id,
            email: user.email,
            username: user.username,
            token,
            getPointLogin
        }
    };
};

/**
 * grantDailyLoginReward - 檢查並發放每日登入獎勵
 * @param {number} sid - 使用者 ID
 * @returns {object} - { getPointLogin: boolean }
 */
export const grantDailyLoginReward = async (sid) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pointsIncCount = await prisma.member_points_inc.count({
        where: {
            user_id: sid,
            reason: '登入獲得',
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    if (pointsIncCount === 0) {
        await prisma.member_points_inc.create({
            data: {
                user_id: sid,
                points_increase: 10,
                reason: '登入獲得',
                created_at: new Date()
            }
        });
        return { getPointLogin: true };
    }

    return { getPointLogin: false };
};

export const verifyOtp = async (email, token) => {
    const otpRecord = await prisma.otp.findFirst({
        where: { email: email.trim(), token: token.trim() }
    });

    if (!otpRecord) {
        return { success: false, error: '電子郵件或是驗證碼有誤' };
    }

    if (Date.now() > Number(otpRecord.exp_timestamp)) {
        return { success: false, error: '驗證碼已到期' };
    }

    return { success: true, otpRecord };
};

export const registerUser = async (username, email, password) => {
    const existingUser = await prisma.member_user.findFirst({
        where: { email: email.trim() }
    });

    if (existingUser) {
        return { success: false, error: '已註冊過此電子郵件', code: 470 };
    }

    const password_hash = await bcrypt.hash(password.trim(), 12);
    const newUser = await prisma.member_user.create({
        data: {
            username: username.trim(),
            email: email.trim(),
            password_hash: password_hash
        }
    });

    // 註冊成功後刪除該 Email 的 OTP
    await prisma.otp.deleteMany({
        where: { email: email.trim() }
    });

    return { success: true, data: { username: newUser.username, email: newUser.email } };
};

export const updatePasswordByOtp = async (email, password) => {
    const user = await prisma.member_user.findFirst({
        where: { email: email.trim() }
    });

    if (!user) {
        return { success: false, error: '無此電子郵件' };
    }

    if (user.google_uid !== null) {
        return { success: false, error: '綁定google登入之電子郵件不適用' };
    }

    const isOldPassword = await bcrypt.compare(password.trim(), user.password_hash);
    if (isOldPassword) {
        return { success: false, error: '錯誤 - 新密碼不可與舊密碼相同', code: 450 };
    }

    const password_hash = await bcrypt.hash(password.trim(), 12);
    await prisma.member_user.update({
        where: { user_id: user.user_id },
        data: { password_hash: password_hash }
    });

    // 修改成功後刪除 OTP
    await prisma.otp.deleteMany({
        where: { email: email.trim() }
    });

    return { success: true };
};

export const googleLogin = async ({ displayName, email, uid, photoURL }) => {
    let user = await prisma.member_user.findFirst({
        where: { google_uid: uid }
    });

    if (!user) {
        user = await prisma.member_user.create({
            data: {
                google_uid: uid,
                username: displayName || 'Google User',
                email: email,
                avatar: photoURL
            }
        });
    }

    // 檢查並發放今日登入積分
    const { getPointLogin } = await grantDailyLoginReward(user.user_id);

    const token = jwt.sign(
        { id: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    );

    return {
        success: true,
        data: {
            id: user.user_id,
            username: user.username,
            google_uid: user.google_uid,
            email: user.email,
            avatar: user.avatar,
            token,
            getPointLogin
        }
    };
};
