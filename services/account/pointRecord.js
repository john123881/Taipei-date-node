import prisma from "../../utils/prisma-client.js";
import dayjs from 'dayjs';

export const getPointRecords = async ({ sid, page, perPage, source, date_begin, date_end, sortOrder }) => {
    const whereClause = { user_id: sid };
    if (source === '登入獲得' || source === '遊玩遊戲') {
        whereClause.reason = { contains: source };
    }
    const dateFormat = 'YYYY/MM/DD';
    if (dayjs(date_begin, dateFormat, true).isValid()) {
        whereClause.created_at = { ...whereClause.created_at, gte: dayjs(date_begin).startOf('day').toDate() };
    }
    if (dayjs(date_end, dateFormat, true).isValid()) {
        whereClause.created_at = { ...whereClause.created_at, lte: dayjs(date_end).endOf('day').toDate() };
    }

    const totalRows = await prisma.member_points_inc.count({ where: whereClause });
    if (totalRows === 0) return { totalRows, data: [] };

    const totalPages = Math.ceil(totalRows / perPage);
    const rows = await prisma.member_points_inc.findMany({
        where: whereClause,
        orderBy: { created_at: sortOrder === 'ASC' ? 'asc' : 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
    });

    const formattedRows = rows.map(row => ({
        ...row,
        created_at: dayjs(row.created_at).format(dateFormat),
    }));

    return { totalRows, totalPages, data: formattedRows };
};
