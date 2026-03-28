import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarType, getBarTypeById } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barTypeRouter = express.Router();

barTypeRouter.get(bar.getBarType, async (req, res) => {
    try {
        const { bar_type_id } = req.params;
        const results = await getBarTypeById(bar_type_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barTypeRouter.get('/bar-type', async (req, res) => {
    try {
        const results = await getBarType();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barTypeRouter;