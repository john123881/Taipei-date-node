import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getPointRecords } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const recordPointRouter = express.Router();

//紀錄 - 積分列表
recordPointRouter.get(account.recordPoint, authenticate, async (req, res) => {
    try {
        if (!req.my_jwt?.id) {
            return sendError(res, '沒授權', 401);
        }

        if (req.my_jwt?.id != req.params.sid) {
            return sendError(res, 'UserID不匹配', 403);
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

        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            const targetPage = page < 1 ? 1 : totalPages;
            const newQuery = { ...req.query, page: targetPage };
            const qp = new URLSearchParams(newQuery).toString();
            return res.redirect(`${req.originalUrl.split('?')[0]}?${qp}`);
        }

        sendSuccess(res, data || [], null, {
            sid,
            totalRows,
            page,
            totalPages,
            perPage,
        });

    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default recordPointRouter;
