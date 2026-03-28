import express from 'express';
import { trip } from '../apiConfig.js';
import { deleteDetail } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.delete(trip.deleteDetail, async (req, res) => {
    try {
        const { trip_detail_id } = req.params;
        const result = await deleteDetail(trip_detail_id);
        if (result) {
            sendSuccess(res, null, '資料刪除成功');
        } else {
            sendError(res, '沒有找到 trip_detail_id 相符的資料', 404);
        }
    } catch (error) {
        sendError(res, '從資料庫刪除資料失敗', 500, error);
    }
});

export default router;
