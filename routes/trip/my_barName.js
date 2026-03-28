import express from 'express';
import { trip } from '../apiConfig.js';
import { getBarNameForPhoto } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

//用於取的電影照片所需要的名稱
const router = express.Router();

router.get(trip.getMyBarNameForPhoto, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getBarNameForPhoto(trip_plan_id);

        // 格式化結果以符合原始 SQL 輸出
        const formattedResults = (results || []).map((r) => ({
            trip_detail_id: r.trip_detail_id,
            trip_plan_id: r.trip_plan_id,
            block: r.block,
            bar_name: r.bars?.bar_name,
            bar_city: r.bars?.bar_city,
            bar_description: r.bars?.bar_description,
        }));

        sendSuccess(res, formattedResults);
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

export default router;
