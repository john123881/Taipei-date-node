import express from 'express';
import { bar } from '../apiConfig.js';
import { createBarBooking, getBarBookingById } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barBookingRouter = express.Router();

// POST - 新增訂位
barBookingRouter.post(bar.createBarBooking, async (req, res) => {
    const {
        user_id,
        bar_id,
        bar_booking_time,
        bar_booking_people_num,
        bar_time_slot_id,
    } = req.body;

    if (
        !user_id ||
        !bar_id ||
        !bar_booking_time ||
        !bar_booking_people_num ||
        !bar_time_slot_id
    ) {
        return sendError(res, '必須提供完整內容: user_id, bar_id, bar_booking_time, bar_booking_people_num, 和 bar_time_slot_id', 400);
    }

    try {
        const newBarBooking = await createBarBooking(
            user_id,
            bar_id,
            bar_booking_time,
            bar_booking_people_num,
            bar_time_slot_id
        );
        sendSuccess(res, newBarBooking, '訂位新增成功');
    } catch (err) {
        sendError(res, '訂位新增失敗', 500, err);
    }
});

// 獲得指定的酒吧的預約列表
barBookingRouter.get(bar.getBarBookingById, async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarBookingById(bar_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});
export default barBookingRouter;
