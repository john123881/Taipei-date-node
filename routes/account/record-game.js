import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const recordGameRouter = express.Router();

//紀錄 - 遊戲列表
recordGameRouter.get(account.recordGame, authenticate, async (req, res) => {
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

        // 1. 建立篩選條件
        const whereClause = {
            user_id: sid
        };

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
        const totalRows = await prisma.member_game_record.count({
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

        // 4. 排序處理
        const sortDirection = req.query.sortDirection === 'ASC' ? 'asc' : 'desc';
        let sortField = 'created_at';
        if (['game_score', 'game_time', 'created_at'].includes(req.query.sortField)) {
            sortField = req.query.sortField;
        }

        // 5. 取得分頁資料
        const rows = await prisma.member_game_record.findMany({
            where: whereClause,
            orderBy: { [sortField]: sortDirection },
            skip: (page - 1) * perPage,
            take: perPage
        });

        // 6. 格式化結果
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
        console.error('Game Record GET Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default recordGameRouter;
