import express from 'express';
import { bar } from '../apiConfig.js';
import { createBarBooking, getBarBookingById } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';

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

    console.log('Received booking data:', req.body);

    if (
        !user_id ||
        !bar_id ||
        !bar_booking_time ||
        !bar_booking_people_num ||
        !bar_time_slot_id
    ) {
        return res.status(400).json({
            status: false,
            message:
                '必須提供完整內容: user_id, bar_id, bar_booking_time, bar_booking_people_num, 和 bar_time_slot_id',
        });
    }

    try {
        const newBarBooking = await createBarBooking(
            user_id,
            bar_id,
            bar_booking_time,
            bar_booking_people_num,
            bar_time_slot_id
        );
        res.status(201).json({
            status: true,
            message: '訂位新增成功',
            booking: newBarBooking,
        });
    } catch (err) {
        console.error('新增訂位錯誤:', err);
        res.status(500).json({
            status: false,
            message: '訂位新增失敗',
            error: err.message,
        });
    }
});

// 獲得指定的酒吧的預約列表
barBookingRouter.get(bar.getBarBookingById, async (req, res) => {
    const { bar_id } = req.params;
    try {
        const results = await getBarBookingById(bar_id);
        res.json(results);
    } catch (error) {
        console.error(`Error fetching bookings for bar ${bar_id}:`, error);
        res.status(500).send('Internal Server Error');
    }
});
export default barBookingRouter;
