import express from 'express';
import { trip } from '../apiConfig.js';
import { getMyBarPhoto } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

//用於取得bar圖片
const router = express.Router();

router.get(trip.getMyBarPhoto, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMyBarPhoto(trip_plan_id);

        // 格式化結果以符合原始 SQL 輸出
        const formattedResults = (results || []).map((r) => {
            const pic = r.bars?.bar_pic?.[0];
            return {
                trip_detail_id: r.trip_detail_id,
                trip_plan_id: r.trip_plan_id,
                block: r.block,
                bar_id: r.bar_id,
                bar_pic_name: pic?.bar_pic_name || '',
                bar_img: pic?.bar_img || null,
                bar_img_url: pic?.bar_img_url || null,
            };
        });

        sendSuccess(res, formattedResults);
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

export default router;
