import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import authenticate from '../../middlewares/authenticate.js';

const collectListRouter = express.Router();

//Navbar收藏列表
collectListRouter.get(account.collectList, authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;

        let rows = [];
        //放入SQL
        const query = `
            (
                SELECT
                    posts.user_id AS author_id,
                    author.email AS author_email,
                    author.avatar AS author_avatar,
                    users.user_id,
                    users.username,
                    users.email,
                    comm_saved.comm_saved_id AS saved_id,
                    comm_saved.post_id AS item_id,
                    comm_saved.created_at AS created_at,
                    pic.img AS img,
                    pic.photo_name AS img_name,
                CASE
                    WHEN author.username IS NOT NULL THEN author.username
                    ELSE 'Unknown'
                END AS title,
                    COALESCE(likes.likes_count, 0) AS subtitle,
                    posts.context AS content,
                    NULL AS rating,
                    'post' AS item_type
                FROM member_user AS users
                LEFT JOIN comm_saved ON users.user_id = comm_saved.user_id
                LEFT JOIN comm_photo AS pic ON pic.post_id = comm_saved.post_id
                LEFT JOIN comm_post AS posts ON posts.post_id = comm_saved.post_id
                LEFT JOIN member_user AS author ON posts.user_id = author.user_id
                LEFT JOIN (
                SELECT post_id, COUNT(*) AS likes_count
                FROM comm_likes
                GROUP BY post_id
            ) AS likes ON posts.post_id = likes.post_id
                WHERE users.user_id = ${sid}
            UNION
                SELECT
                NULL AS author_id,
                NULL AS author_email,
                NULL AS author_avatar,
                    users.user_id,
                    users.username,
                    users.email,
                    bar_saved.bar_saved_id AS saved_id,
                    bar_saved.bar_id AS item_id,
                    bar_saved.created_at AS created_at,
                    pic.bar_img AS img,
                    pic.bar_pic_name AS img_name,
                    bars.bar_name AS title,
                    bars.bar_addr AS subtitle,
                    bars.bar_description AS content,
                    NULL AS rating,
                    'bar' AS item_type
                FROM member_user AS users
                LEFT JOIN bar_saved ON users.user_id = bar_saved.user_id
                LEFT JOIN bar_pic AS pic ON pic.bar_id = bar_saved.bar_id
                LEFT JOIN bars AS bars ON bars.bar_id = bar_saved.bar_id
                WHERE users.user_id = ${sid}
            UNION
                SELECT
                NULL AS author_id,
                NULL AS author_email,
                NULL AS author_avatar,
                    users.user_id,
                    users.username,
                    users.email,
                    movie_saved.booking_movie_saved_id AS saved_id,
                    movie_saved.movie_id AS item_id,
                    movie_saved.created_at AS created_at,
                    movies.movie_img AS img,
                    movies.poster_img AS img_name,
                    movies.title AS title,
                    movies_type.movie_type AS subtitle,
                    movies.movie_description AS content,
                    movies.movie_rating AS rating,
                    'movie' AS item_type
                FROM member_user AS users
                LEFT JOIN booking_movie_saved AS movie_saved ON users.user_id = movie_saved.user_id
                LEFT JOIN booking_movie AS movies ON movies.movie_id = movie_saved.movie_id
                LEFT JOIN booking_movie_type AS movies_type ON movies.movie_type_id = movies_type.movie_type_id
                WHERE users.user_id = ${sid}
            )
            ORDER BY created_at DESC
            LIMIT 0, 10`;
        [rows] = await db.query(query);

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const lists = rows.map((list) => {
            if (list.img) {
                const imageBase64 = Buffer.from(list.img).toString('base64');
                return {
                    ...list,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }

            return list;
        });
        //過濾掉沒有save_id的 DATA
        const listsFiltered = lists.filter((list) => list.saved_id !== null);

        output.success = true;
        output.data = listsFiltered;
        output.code = 200;

        res.json({
            success: true,
            sid,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in collect-list:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default collectListRouter;
