import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
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

        let sid = req.my_jwt?.id || 0;

        let page = +req.query.page || 1;

        let where = ' WHERE 1 ';

        //日期篩選
        const dateFormat = 'YYYY/MM/DD';
        let date_begin = req.query.date_begin || '';
        let date_end = req.query.date_end || '';

        if (dayjs(date_begin, dateFormat, true).isValid()) {
            date_begin = dayjs(date_begin).format(dateFormat);
        } else {
            date_begin = '';
        }
        if (dayjs(date_end, dateFormat, true).isValid()) {
            date_end = dayjs(date_end).add(1, 'day').format(dateFormat);
        } else {
            date_end = '';
        }

        //日期SQL語法新增到where
        if (date_begin) {
            where += ` AND \`created_at\` >=  '${date_begin}' `;
        }
        if (date_end) {
            where += ` AND \`created_at\` <=  '${date_end}' `;
        }

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
            return res.redirect(redirectUrl);
        }

        const perPage = 10;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM member_game_record ${where} AND user_id = ${sid}`;
        const [[{ totalRows }]] = await db.query(total_sql_point);

        let rows = [];
        let totalPages = 0;
        //計算總頁數，並且判斷當前頁面有無超過總頁數，有的話跳轉到最後一頁
        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
                return res.redirect(redirectUrl);
            }

            let sort = req.query.sortDate || 'DESC';
            if (req.query.sortDirection === 'ASC') {
                sort = 'ASC';
            }

            let sortField = 'created_at';
            if (
                ['game_score', 'game_time', 'created_at'].includes(
                    req.query.sortField
                )
            ) {
                sortField = req.query.sortField;
            }

            //放入SQL
            const sqlPoint = `SELECT * 
                            FROM member_game_record 
                            ${where} AND user_id=${sid} 
                            ORDER BY ${sortField} ${sort} 
                            LIMIT ${(page - 1) * perPage} , ${perPage}`;
            [rows] = await db.query(sqlPoint);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無相關紀錄';
            output.data = [];
            return res.json({ success: false, output });
        }

        //將日期轉成YYYY/MM/DD
        const formattedRowsPoint = rows.map((row, i) => ({
            ...row,
            created_at: dayjs(row.created_at).format(dateFormat),
        }));

        output.success = true;
        output.data = formattedRowsPoint;
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
        console.error('Error in /record-point/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default recordGameRouter;
