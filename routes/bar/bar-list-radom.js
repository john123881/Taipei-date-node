import express from 'express';
import { bar } from '../apiConfig.js';
import {getBarListRandom} from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barListRadomRouter = express.Router();

barListRadomRouter.get(bar.getBarListRandom, async (_req, res) => {
    try {
        const results = await getBarListRandom();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});


export default barListRadomRouter;
