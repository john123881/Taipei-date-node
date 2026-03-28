import express from 'express';
import { trip } from '../apiConfig.js';
import { editDnN, editShare } from '../../services/index.js';

const router = express.Router();

router.post(trip.editDnN, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const { trip_description, trip_notes } = req.body;
        const result = await editDnN(trip_plan_id, trip_description, trip_notes);
        if (result) {
            res.json({ status: true, message: '行程描述與備註更新成功' });
        } else {
            res.status(404).json({ status: false, message: '找不到指定的行程' });
        }
    } catch (error) {
        console.error('editDnN error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

router.post(trip.editShare, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await editShare(trip_plan_id);
        if (result) {
            res.json({ status: true, message: '行程分享狀態已更新' });
        } else {
            res.status(404).json({ status: false, message: '找不到指定的行程' });
        }
    } catch (error) {
        console.error('editShare error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
