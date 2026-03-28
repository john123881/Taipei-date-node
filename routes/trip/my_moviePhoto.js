import express from 'express';
import { trip } from '../apiConfig.js';
import { getMyMoviePhoto } from '../../services/index.js';

//用於取得movie圖片
const router = express.Router();

router.get(trip.getMyMoviePhoto, async (req, res) => {
    try {
        const { trip_plan_id } = req.params;
        const results = await getMyMoviePhoto(trip_plan_id);

        if (!results || results.length === 0) {
            return res.status(404).json({
                message: 'No picture found for this trip detail.',
            });
        }

        // 格式化結果以符合原始 SQL 輸出
        const formattedResults = results.map((r) => ({
            trip_detail_id: r.trip_detail_id,
            trip_plan_id: r.trip_plan_id,
            block: r.block,
            movie_id: r.movie_id,
            title: r.booking_movie?.title,
            poster_img: r.booking_movie?.poster_img,
            movie_description: r.booking_movie?.movie_description,
            movie_img: r.booking_movie?.movie_img,
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error in getMyMoviePhoto router:', error);
        res.status(500).json({ error: 'Error fetching data from the database' });
    }
});

export default router;
