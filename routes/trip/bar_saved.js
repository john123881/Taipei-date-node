import express from 'express';
import { trip } from '../apiConfig.js';
import { getBarSaved } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getBarSaved, async (req, res) => {
    try {
        const results = await getBarSaved();
        const formattedResults = (results || []).map((r) => ({
            ...r,
            bar_area_name: r.bar_area?.bar_area_name,
            bar_type_name: r.bar_type?.bar_type_name,
            bar_pic_name: r.bar_pic[0]?.bar_pic_name,
            bar_img: r.bar_pic[0]?.bar_img,
            bar_img_url: r.bar_pic[0]?.bar_img_url,
        }));
        sendSuccess(res, formattedResults);
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

export default router;
