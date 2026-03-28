import express from 'express';
import { account } from '../apiConfig.js';
import { addMockData } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const addDataRouter = express.Router();

addDataRouter.post(account.addData, async (req, res) => {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    if (data.length === 0) {
        return sendError(res, '請提供有效的資料', 400);
    }

    try {
        const results = await addMockData(data);
        sendSuccess(res, results, 'Mock data added successfully', {
            count: results.length,
        });
    } catch (error) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            return sendError(res, 'Email 已存在', 400);
        }
        if (error.message === 'USER_ID_ALREADY_EXISTS') {
            return sendError(res, 'User ID 已存在', 400);
        }
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default addDataRouter;
