import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarList, getBarListId, getFilteredBarList } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barListRouter = express.Router();

barListRouter.get(bar.getBarList, async (_req, res) => {
    try {
        const results = await getBarList();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barListRouter.get('/bar/bar-list', async (req, res) => {
    try {
        const { bar_area_id, bar_type_id } = req.query;
        const results = await getFilteredBarList({ bar_area_id, bar_type_id });
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barListRouter.get(bar.getBarListId, async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarListId(bar_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 依據bar-type-id篩選

export default barListRouter;
