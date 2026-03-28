import express from "express";
import { bar } from "../apiConfig.js";
import { getBarDetail, getBarDetailById } from "../../services/index.js";
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barDetailRouter = express.Router();

barDetailRouter.get(bar.getBarDetail, async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarDetailById(bar_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

barDetailRouter.get('/bar-detail', async (req, res) => {
    try {
        const results = await getBarDetail();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default barDetailRouter;
