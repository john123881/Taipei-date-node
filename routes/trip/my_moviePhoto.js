import express from 'express';
import { trip } from '../apiConfig.js';
import { getMyMoviePhoto } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

//用於取得movie圖片
const router = express.Router();

router.get(trip.getMyMoviePhoto, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMyMoviePhoto(trip_plan_id);

        // 格式化結果以符合原始 SQL 輸出
        const formattedResults = (results || []).map((r) => ({
            trip_detail_id: r.trip_detail_id,
            trip_plan_id: r.trip_plan_id,
            block: r.block,
            movie_id: r.movie_id,
            title: r.booking_movie?.title,
            poster_img: r.booking_movie?.poster_img,
            movie_description: r.booking_movie?.movie_description,
            movie_img: r.booking_movie?.movie_img,
        }));

        sendSuccess(res, formattedResults);
    } catch (error) {
        sendError(res, 'Error fetching data from the database', 500, error);
    }
});

export default router;
