import express from 'express';
import { trip } from '../apiConfig.js';
import { uploadTripPhoto } from '../../services/index.js';
import coverUpload from '../../utils/upload-cover.js';

const router = express.Router();

router.post(
    trip.uploadTripPhoto,
    coverUpload.single('tripPic'),
    async (req, res) => {
        let output = {
            success: false,
            bodyData: { body: req.body, file: req.file },
            msg: '',
        };

        try {
            if (req.file) {
                const { trip_plan_id } = req.params;
                const fileName = req.file.filename;
                // 注意: 這裡保留了 localhost 的硬編碼路徑，建議未來遷移到相對路徑或 CDN
                const filePath = `http://localhost:${process.env.WEB_PORT || 3002}/tripcover/${fileName}`;

                const result = await uploadTripPhoto(trip_plan_id, filePath);

                output.success = !!result;
                output.msg = output.success
                    ? '行程封面成功更新。'
                    : '未找到指定 ID 的行程計劃';
            } else {
                output.msg = '沒有文件上傳';
            }
            res.json(output);
        } catch (error) {
            console.error('Error in uploadTripPhoto router:', error);
            res.status(500).json({ success: false, msg: '更新數據庫數據時出錯' });
        }
    }
);

export default router;
