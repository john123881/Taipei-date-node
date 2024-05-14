import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarBookingList, getBarBookingListById } from '../../services/index.js';
// 中介軟體，存取隱私會員資料用
import authenticate from '../../middlewares/authenticate.js';

const barBookingListRouter = express.Router();

// 獲得所有酒吧預約列表
barBookingListRouter.get(bar.getBarBookingList, authenticate, async (req, res) => {
    console.log('1', req.my_jwt);
    try {
        const results = await getBarBookingList();
        res.json(results);
    } catch (error) {
        console.error('Error fetching bar booking list:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 獲得指定用户的酒吧預約列表
barBookingListRouter.get(`${bar.getBarBookingList}/:user_id`,authenticate, async (req, res) => {
    const { user_id } = req.params;
    try {
        const results = await getBarBookingListById(user_id);
        res.json(results);
    } catch (error) {
        console.error(`Error fetching bookings for user ${user_id}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

export default barBookingListRouter;