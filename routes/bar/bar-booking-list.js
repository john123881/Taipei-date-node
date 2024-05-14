import express from 'express';
import { bar } from '../apiConfig.js';
import {
    getBarBookingList,
    getBarBookingListById,
    deleteBarBooking,
} from '../../services/index.js';

const barBookingListRouter = express.Router();

// 獲得所有酒吧預約列表
barBookingListRouter.get(bar.getBarBookingList, async (req, res) => {
    try {
        const results = await getBarBookingList();
        res.json(results);
    } catch (error) {
        console.error('Error fetching bar booking list:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 獲得指定用户的酒吧預約列表
barBookingListRouter.get(
    `${bar.getBarBookingList}/:user_id`,
    async (req, res) => {
        const { user_id } = req.params;
        try {
            const results = await getBarBookingListById(user_id);
            res.json(results);
        } catch (error) {
            console.error(
                `Error fetching bookings for user ${user_id}:`,
                error
            );
            res.status(500).send('Internal Server Error');
        }
    }
);

barBookingListRouter.delete(bar.deleteBarBooking, async (req, res) => {
    const { barBookingId } = req.body;

    console.log('body', req.body);

    console.log('barBooingId', barBookingId);

    if (!barBookingId) {
        return res.status(400).json({
            status: false,
            message: '必須提供 barBookingId',
        });
    }

    try {
        const results = await deleteBarBooking(barBookingId);
        return res.status(201).json({
            status: true,
            message: '移除酒吧訂位成功',
            data: results,
        });
    } catch (err) {
        console.error('移除酒吧訂位錯誤:', err);
        res.status(500).json({
            status: false,
            message: '移除酒吧訂位失敗',
            error: err.message,
        });
    }
});

export default barBookingListRouter;
