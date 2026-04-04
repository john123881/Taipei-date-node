import express from 'express';
import { trip } from '../apiConfig.js';
import { editDnN, editShare } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(trip.editDnN, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const { trip_description, trip_notes, trip_title, trip_date } = req.body;
        const result = await editDnN(trip_plan_id, trip_description, trip_notes, trip_title, trip_date);
        if (result) {
            sendSuccess(res, result, '行程描述與備註更新成功');
        } else {
            sendError(res, '找不到指定的行程', 404);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.post(trip.editShare, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await editShare(trip_plan_id);
        if (result) {
            sendSuccess(res, result, '行程分享狀態已更新');
        } else {
            sendError(res, '找不到指定的行程', 404);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default router;
