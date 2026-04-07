import { generateToken } from './otp.js';
import prisma from './prisma-client.js';
import logger from './logger.js';

// 判斷是否可以重設token, true代表可以重設
const shouldReset = (expTimestamp, exp, limit = 60) => {
    const createdTimestamp = Number(expTimestamp) - exp * 60 * 1000;
    return Date.now() - createdTimestamp > limit * 1000;
};

// exp = 是 30 分到期,  limit = 60 是 60秒內不產生新的token
const createOtpForRegister = async (email, exp = 30, limit = 60) => {
    // 檢查otp是否已經存在
    const otpRecord = await prisma.otp.findFirst({
        where: { email: email }
    });

    // 找到記錄，因為在60s(秒)內限制，所以"不能"產生新的otp token
    if (otpRecord && !shouldReset(otpRecord.exp_timestamp, exp, limit)) {
        logger.warn(`OTP rate limit hit for ${email}: 60s(秒)內要求重新產生otp`);
        return {};
    }

    const token = generateToken(email);
    const exp_timestamp = BigInt(Date.now() + exp * 60 * 1000);

    if (otpRecord) {
        // 修改Otp
        const updatedOtp = await prisma.otp.update({
            where: { otp_id: otpRecord.otp_id },
            data: {
                token: Number(token),
                exp_timestamp: exp_timestamp
            }
        });
        return {
            ...updatedOtp,
            exp_timestamp: Number(updatedOtp.exp_timestamp)
        };
    } else {
        // 新增Otp
        const newOtp = await prisma.otp.create({
            data: {
                email: email,
                token: Number(token),
                exp_timestamp: exp_timestamp
            }
        });
        return {
            ...newOtp,
            exp_timestamp: Number(newOtp.exp_timestamp)
        };
    }
};

const createOtpForPassword = async (email, userId, exp = 30, limit = 60) => {
    // 檢查otp是否已經存在
    const otpRecord = await prisma.otp.findFirst({
        where: { email: email }
    });

    // 找到記錄，因為在60s(秒)內限制，所以"不能"產生新的otp token
    if (otpRecord && !shouldReset(otpRecord.exp_timestamp, exp, limit)) {
        return {};
    }

    const token = generateToken(email);
    const exp_timestamp = BigInt(Date.now() + exp * 60 * 1000);

    if (otpRecord) {
        // 修改Otp
        const updatedOtp = await prisma.otp.update({
            where: { otp_id: otpRecord.otp_id },
            data: {
                user_id: userId,
                token: Number(token),
                exp_timestamp: exp_timestamp
            }
        });
        return {
            ...updatedOtp,
            exp_timestamp: Number(updatedOtp.exp_timestamp)
        };
    } else {
        // 新增Otp
        const newOtp = await prisma.otp.create({
            data: {
                user_id: userId,
                email: email,
                token: Number(token),
                exp_timestamp: exp_timestamp
            }
        });
        return {
            ...newOtp,
            exp_timestamp: Number(newOtp.exp_timestamp)
        };
    }
};

export { createOtpForRegister, createOtpForPassword };
