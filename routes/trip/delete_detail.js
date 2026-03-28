import express from 'express';
import { trip } from '../apiConfig.js';
import { deleteDetail } from '../../services/index.js';

const router = express.Router();

router.delete(trip.deleteDetail, async (req, res) => {
    try {
        const { trip_detail_id } = req.params;
        const result = await deleteDetail(trip_detail_id);
        if (result) {
            res.status(200).json({ success: true, message: '資料刪除成功' });
        } else {
            res.status(404).json({
                success: false,
                message: '沒有找到 trip_detail_id 相符的資料',
            });
        }
    } catch (error) {
        console.error('Error in deleteDetail router:', error);
        res.status(500).json({
            success: false,
            message: '從資料庫刪除資料失敗',
            error: error.message,
        });
    }
});

export default router;
