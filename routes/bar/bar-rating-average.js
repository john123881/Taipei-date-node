import express from 'express';
import { bar } from '../apiConfig.js';
import {
    getBarRatingAverage
} from '../../services/index.js';

const barRatingAverageRouter = express.Router();

// 獲得所有酒吧預約列表
// barRatingAverageRouter.get(bar.test, async (req, res) => {
//     try {
//         const results = await getBarRatingAverage();
//         res.json(results);
//     } catch (error) {
//         console.error('Error fetching bar booking list:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// 獲取指定 bar_id 的平均評分
barRatingAverageRouter.get(bar.getBarRatingAverage, async (req, res) => {
    const { bar_id } = req.params;
    try {
        const averageRating = await getBarRatingAverage(bar_id);
        if (averageRating !== null) {
            res.json({ success: true, averageRating });
        } else {
            res.status(404).json({
                success: false,
                message: 'No ratings found for this bar.',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error,
        });
    }
});

export default barRatingAverageRouter;
