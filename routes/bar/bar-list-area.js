import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarListArea } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barListAreaRouter = express.Router();

barListAreaRouter.get(bar.getBarListArea, async (req, res) => {
    try {
        const { bar_area_id } = req.params;
        const results = await getBarListArea(bar_area_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barListAreaRouter.get(bar.getBarListType, async (_req, res) => {
    try {
        const results = await getBarListArea();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barListAreaRouter;
