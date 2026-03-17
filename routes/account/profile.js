import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const profileRouter = express.Router();

// 首頁-讀取個人單筆資料 API
// http://localhost:3001/account/1
profileRouter.get(account.getProfile, authenticate, async (req, res) => {
    const output = {
        success: false,
        action: '',
        error: '',
        code: 0,
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let sid = +req.params.sid || 0;

    try {
        // 1. 取得使用者基本資料與關聯類型
        const user = await prisma.member_user.findUnique({
            where: { user_id: sid },
            include: {
                bar_type: true,
                movie_type: true,
                member_points_inc: {
                    select: { points_increase: true }
                },
                booking_points_dec: {
                    select: { points_decrease: true }
                }
            }
        });

        if (!user) {
            output.success = false;
            output.code = 440;
            output.error = '沒有該筆資料';
            return res.json(output);
        }

        // 2. 計算總積分 (Prisma 中手動加總以維持類型安全)
        const totalPointsInc = user.member_points_inc.reduce((sum, item) => sum + item.points_increase, 0);
        const totalPointsDec = user.booking_points_dec.reduce((sum, item) => sum + item.points_decrease, 0);
        const total_points = totalPointsInc - totalPointsDec;

        // 3. 處理格式轉換以符合原本 API 需求 (Flattened structure)
        const responseData = {
            ...user,
            bar_type_name: user.bar_type?.bar_type_name || null,
            movie_type: user.movie_type?.movie_type || null,
            total_points: total_points,
            birthday: user.birthday ? dayjs(user.birthday).format('YYYY-MM-DD') : null
        };

        // 4. 查詢今天有無獲得積分 (登入 & 遊玩)
        const todayStart = dayjs().startOf('day').toDate();
        const nextDayStart = dayjs().add(1, 'day').startOf('day').toDate();
        
        const loginPointsCount = await prisma.member_points_inc.count({
            where: {
                user_id: sid,
                reason: '登入獲得',
                created_at: {
                    gte: todayStart,
                    lt: nextDayStart
                }
            }
        });

        const playPointsCount = await prisma.member_points_inc.count({
            where: {
                user_id: sid,
                reason: '遊玩遊戲',
                created_at: {
                    gte: todayStart,
                    lt: nextDayStart
                }
            }
        });

        res.json({
            success: true,
            data: responseData,
            hasPlay: playPointsCount > 0,
            hasLogin: loginPointsCount > 0,
        });

    } catch (error) {
        console.error('Profile API Error:', error);
        res.status(500).json({ success: false, error: '伺服器內部錯誤' });
    }
});

export default profileRouter;
