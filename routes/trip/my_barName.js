import express from 'express';
import { trip } from '../apiConfig.js';
import { getBarNameForPhoto } from '../../services/index.js';

//用於取的電影照片所需要的名稱
const router = express.Router();

router.get(trip.getMyBarNameForPhoto, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getBarNameForPhoto(trip_plan_id);

        if (!results || results.length === 0) {
            return res.status(404).json({
                message: 'No name found for this bar detail.',
            });
        }

        // 格式化結果以符合原始 SQL 輸出 (include -> flattend fields)
        const formattedResults = results.map((r) => ({
            trip_detail_id: r.trip_detail_id,
            trip_plan_id: r.trip_plan_id,
            block: r.block,
            bar_name: r.bars?.bar_name,
            bar_city: r.bars?.bar_city,
            bar_description: r.bars?.bar_description,
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error in getBarNameForPhoto router:', error);
        res.status(500).json({ error: 'Error fetching data from the database' });
    }
});

export default router;
