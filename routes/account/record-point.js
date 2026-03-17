import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getPointRecords } from '../../services/index.js';

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

        const { totalRows, totalPages, data } = await getPointRecords({
            sid,
            page,
            perPage,
            source: req.query.selectedValue || '',
            date_begin: req.query.date_begin || '',
            date_end: req.query.date_end || '',
            sortOrder: req.query.sortDate
        });

        if (totalRows === 0) {
            output.code = 440;
            output.error = '無相關紀錄';
            output.data = [];
            return res.json({ success: false, output });
        }

        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            const targetPage = page < 1 ? 1 : totalPages;
            const newQuery = { ...req.query, page: targetPage };
            const qp = new URLSearchParams(newQuery).toString();
            return res.redirect(`${req.originalUrl.split('?')[0]}?${qp}`);
        }

        output.success = true;
        output.data = data;
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
