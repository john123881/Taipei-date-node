import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarArea, getBarAreaById } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barAreaRouter = express.Router();

barAreaRouter.get(bar.getBarArea, async (req, res) => {
    try {
        const { bar_area_id } = req.params;
        const results = await getBarAreaById(bar_area_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barAreaRouter.get('/bar-area', async (req, res) => {
    try {
        const results = await getBarArea();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barAreaRouter;
