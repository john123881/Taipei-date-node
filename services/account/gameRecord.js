import prisma from "../../utils/prisma-client.js";
import dayjs from 'dayjs';

export const getGameRecords = async ({ sid, page, perPage, date_begin, date_end, sortField, sortDirection }) => {
    const whereClause = { user_id: sid };
    const dateFormat = 'YYYY/MM/DD';
    if (dayjs(date_begin, dateFormat, true).isValid()) {
        whereClause.created_at = { ...whereClause.created_at, gte: dayjs(date_begin).startOf('day').toDate() };
    }
    if (dayjs(date_end, dateFormat, true).isValid()) {
        whereClause.created_at = { ...whereClause.created_at, lte: dayjs(date_end).endOf('day').toDate() };
    }

    const totalRows = await prisma.member_game_record.count({ where: whereClause });
    if (totalRows === 0) return { totalRows, data: [] };

    const totalPages = Math.ceil(totalRows / perPage);
    const rows = await prisma.member_game_record.findMany({
        where: whereClause,
        orderBy: { [sortField || 'created_at']: sortDirection === 'ASC' ? 'asc' : 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
    });

    const formattedRows = rows.map(row => ({
        ...row,
        created_at: dayjs(row.created_at).format(dateFormat),
    }));

    return { totalRows, totalPages, data: formattedRows };
};

export const createGameRecord = async (sid, gameScore, formattedTime) => {
    // 1. 新增遊戲紀錄
    const gameRecord = await prisma.member_game_record.create({
        data: {
            user_id: sid,
            game_score: gameScore,
            game_time: new Date(`1970-01-01T${formattedTime}Z`),
        }
    });

    // 2. 檢查今天是否已獲得遊戲積分
    const todayStart = dayjs().startOf('day').toDate();
    const nextDayStart = dayjs().add(1, 'day').startOf('day').toDate();

    const countTodayPlayPoints = await prisma.member_points_inc.count({
        where: {
            user_id: sid,
            reason: '遊玩遊戲',
            created_at: { gte: todayStart, lt: nextDayStart }
        }
    });

    let getPointPlay = false;
    if (countTodayPlayPoints === 0) {
        await prisma.member_points_inc.create({
            data: {
                user_id: sid,
                points_increase: 10,
                reason: '遊玩遊戲',
                created_at: new Date()
            }
        });
        getPointPlay = true;
    }

    return { gameRecord, getPointPlay };
};
