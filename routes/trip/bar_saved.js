import express from 'express';
import { trip } from '../apiConfig.js';
import { getBarSaved } from '../../services/index.js';

const router = express.Router();

router.get(trip.getBarSaved, async (req, res) => {
    try {
        const results = await getBarSaved();
        if (results && results.length > 0) {
            // 格式化以匹配 SQL 輸出 (mu.username -> result.username)
            const formattedResults = results.map((r) => ({
                ...r,
                bar_area_name: r.bar_area?.bar_area_name,
                bar_type_name: r.bar_type?.bar_type_name,
                bar_pic_name: r.bar_pic[0]?.bar_pic_name, // 取第一個圖片名稱
            }));
            res.json(formattedResults);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error('Error in getBarSaved router:', error);
        res.status(500).send('Error fetching data from the database');
    }
});

export default router;
