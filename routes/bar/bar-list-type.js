import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarListType } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barListTypeRouter = express.Router();

barListTypeRouter.get(bar.getBarListType, async (req, res) => {
    try {
        const { bar_type_id } = req.params;
        const results = await getBarListType(bar_type_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barListTypeRouter.get(bar.getBarListType, async (_req, res) => {
    try {
        const results = await getBarListType();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barListTypeRouter;
