import prisma from "../../utils/prisma-client.js";
import dayjs from 'dayjs';

export const getProfile = async (sid) => {
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

    if (!user) return null;

    const totalPointsInc = user.member_points_inc.reduce((sum, item) => sum + item.points_increase, 0);
    const totalPointsDec = user.booking_points_dec.reduce((sum, item) => sum + item.points_decrease, 0);
    const total_points = totalPointsInc - totalPointsDec;

    const { password_hash, ...userWithoutPassword } = user;
    return {
        ...userWithoutPassword,
        bar_type_name: user.bar_type?.bar_type_name || null,
        movie_type: user.movie_type?.movie_type || null,
        total_points: total_points,
        birthday: user.birthday ? dayjs(user.birthday).format('YYYY-MM-DD') : null
    };
};

export const checkTodayPoints = async (sid) => {
    const todayStart = dayjs().startOf('day').toDate();
    const nextDayStart = dayjs().add(1, 'day').startOf('day').toDate();
    
    const loginPointsCount = await prisma.member_points_inc.count({
        where: {
            user_id: sid,
            reason: '登入獲得',
            created_at: { gte: todayStart, lt: nextDayStart }
        }
    });

    const playPointsCount = await prisma.member_points_inc.count({
        where: {
            user_id: sid,
            reason: '遊玩遊戲',
            created_at: { gte: todayStart, lt: nextDayStart }
        }
    });

    return {
        hasLogin: loginPointsCount > 0,
        hasPlay: playPointsCount > 0
    };
};
