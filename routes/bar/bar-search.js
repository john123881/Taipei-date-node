import express from 'express';
import { bar } from '../apiConfig.js';
import { searchBars } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barSearchRouter = express.Router();

barSearchRouter.get(bar.searchBars, async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return sendError(res, '需要提供 searchTerm', 400);
        }

        const results = await searchBars(searchTerm);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barSearchRouter;
