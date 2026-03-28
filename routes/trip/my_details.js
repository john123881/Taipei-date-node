import express from 'express';
import { trip } from '../apiConfig.js';
import { getMyDetail, getMyTripName } from '../../services/index.js';

const router = express.Router();

// 使用 apiConfig 中定義的路由
router.get(trip.getMyDetail, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMyDetail(trip_plan_id);
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }
        res.status(200).json(results);
    } catch (error) {
        console.error('Error in getMyDetail router:', error);
        res.status(500).json({ error: 'Error fetching data from the database' });
    }
});

router.get(trip.getMyTripName, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const result = await getMyTripName(trip_plan_id);
        if (result) {
            // 轉換 Prisma 結構以符合原始 SQL 輸出 (mu.username -> result.username)
            const formattedResult = {
                ...result,
                username: result.member_user?.username,
            };
            delete formattedResult.member_user;
            res.json(formattedResult);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error('Error in getMyTripName router:', error);
        res.status(500).send('Error fetching data from the database');
    }
});

export default router;
