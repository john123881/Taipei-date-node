import express from 'express';
import { trip } from '../apiConfig.js';
import { uploadTripPhoto } from '../../services/index.js';
import coverUpload from '../../utils/upload-cover.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.post(
    trip.uploadTripPhoto,
    coverUpload.single('tripPic'),
    async (req, res) => {
        try {
            if (req.file) {
                const { trip_plan_id } = req.params;
                const fileName = req.file.filename;
                const filePath = `http://localhost:${process.env.WEB_PORT || 3002}/tripcover/${fileName}`;

                const result = await uploadTripPhoto(trip_plan_id, filePath);

                if (result) {
                    sendSuccess(res, { filePath }, '行程封面成功更新。');
                } else {
                    sendError(res, '未找到指定 ID 的行程計劃', 404);
                }
            } else {
                sendError(res, '沒有文件上傳', 400);
            }
        } catch (error) {
            sendError(res, '更新數據庫數據時出錯', 500, error);
        }
    }
);

export default router;
