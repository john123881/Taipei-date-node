import express from 'express';
import { bar } from '../apiConfig.js';
import {
    getBarBookingList,
    getBarBookingListById,
    deleteBarBooking,
} from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barBookingListRouter = express.Router();

// 獲得所有酒吧預約列表
barBookingListRouter.get(bar.getBarBookingList, async (req, res) => {
    try {
        const results = await getBarBookingList();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 獲得指定用户的酒吧預約列表
barBookingListRouter.get(
    `${bar.getBarBookingList}/:user_id`,
    async (req, res) => {
        const { user_id } = req.params;
        try {
            const results = await getBarBookingListById(user_id);
            sendSuccess(res, results);
        } catch (error) {
            sendError(res, '伺服器錯誤', 500, error);
        }
    }
);

barBookingListRouter.delete(bar.deleteBarBooking, async (req, res) => {
    const barBookingId = +req.body.bar_booking_id;

    if (!barBookingId) {
        return sendError(res, '必須提供 barBookingId', 400);
    }

    try {
        const results = await deleteBarBooking(barBookingId);
        sendSuccess(res, results, '移除酒吧訂位成功');
    } catch (err) {
        sendError(res, '移除酒吧訂位失敗', 500, err);
    }
});

export default barBookingListRouter;
