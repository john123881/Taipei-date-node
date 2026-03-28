import express from 'express';
import { trip } from '../apiConfig.js';
import { getMyBarPhoto } from '../../services/index.js';

//用於取得bar圖片
const router = express.Router();

router.get(trip.getMyBarPhoto, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMyBarPhoto(trip_plan_id);

        if (!results || results.length === 0) {
            return res.status(404).json({
                message: 'No picture found for this trip detail.',
            });
        }

        // 格式化結果以符合原始 SQL 輸出 (include -> flattend fields)
        const formattedResults = results.map((r) => ({
            trip_detail_id: r.trip_detail_id,
            trip_plan_id: r.trip_plan_id,
            block: r.block,
            bar_id: r.bar_id,
            bar_pic_name: r.bar_pic?.bar_pic_name,
            bar_img: r.bar_pic?.bar_img,
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error in getMyBarPhoto router:', error);
        res.status(500).json({ error: 'Error fetching data from the database' });
    }
});

export default router;
