import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const recordPointRouter = express.Router();

//紀錄 - 積分列表
recordPointRouter.get(account.recordPoint, authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }

        if (req.my_jwt?.id != req.params.sid) {
            output.success = false;
            output.code = 430;
            output.error = 'UserID不匹配';
            return res.json({ output });
        }

        const sid = req.my_jwt?.id || 0;
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const dateFormat = 'YYYY/MM/DD';

        // 1. 建立篩選條件 (Prisma Where Clause)
        const whereClause = {
            user_id: sid
        };

        // 來源篩選
        const source = req.query.selectedValue || '';
        if (source === '登入獲得' || source === '遊玩遊戲') {
            whereClause.reason = {
                contains: source
            };
        }

        // 日期篩選
        let date_begin = req.query.date_begin || '';
        let date_end = req.query.date_end || '';

        if (dayjs(date_begin, dateFormat, true).isValid()) {
            whereClause.created_at = {
                ...whereClause.created_at,
                gte: dayjs(date_begin).startOf('day').toDate()
            };
        }
        if (dayjs(date_end, dateFormat, true).isValid()) {
            whereClause.created_at = {
                ...whereClause.created_at,
                lte: dayjs(date_end).endOf('day').toDate()
            };
        }

        // 2. 取得總筆數
        const totalRows = await prisma.member_points_inc.count({
            where: whereClause
        });

        if (totalRows === 0) {
            output.code = 440;
            output.error = '無相關紀錄';
            output.data = [];
            return res.json({ success: false, output });
        }

        const totalPages = Math.ceil(totalRows / perPage);

        // 3. 處理頁碼跳轉
        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            const targetPage = page < 1 ? 1 : totalPages;
            const newQuery = { ...req.query, page: targetPage };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
            return res.redirect(redirectUrl);
        }

        // 4. 取得分頁資料
        const sortOrder = req.query.sortDate === 'ASC' ? 'asc' : 'desc';

        const rows = await prisma.member_points_inc.findMany({
            where: whereClause,
            orderBy: { created_at: sortOrder },
            skip: (page - 1) * perPage,
            take: perPage
        });

        // 5. 將日期格式化
        const formattedRows = rows.map(row => ({
            ...row,
            created_at: dayjs(row.created_at).format(dateFormat),
        }));

        output.success = true;
        output.data = formattedRows;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            page,
            totalPages,
            perPage,
            query: req.query,
            output,
        });

    } catch (error) {
        console.error('Point Record GET Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default recordPointRouter;
