import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import authenticate from '../../middlewares/authenticate.js';

const collectMovieRouter = express.Router();

//收藏 - 電影列表
collectMovieRouter.get(account.collectMovie, authenticate, async (req, res) => {
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
        const page = parseInt(req.query.page) || 1;

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
            return res.redirect(redirectUrl);
        }
        const perPage = 5;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM booking_movie_saved WHERE user_id = ${sid}`;
        const [[{ totalRows }]] = await db.query(total_sql_point);

        let rows = [];
        let totalPages = 0;

        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
                return res.redirect(redirectUrl);
            }

            //放入SQL
            const query = `
                        SELECT
                            save.booking_movie_saved_id AS save_id,
                            users.email,
                            users.username,
                            movie.title, 
                            movie.movie_id,
                            movie.movie_description AS description,
                            movie.movie_rating AS rating,
                            movie.poster_img AS img_name,
                            movie.movie_img AS img,
                            type.movie_type AS type
                        FROM 
                        booking_movie_saved AS save
                        LEFT JOIN     
                            booking_movie AS movie
                        ON 
                            save.movie_id = movie.movie_id
                        LEFT JOIN 
                            member_user AS users 
                        ON 
                            save.user_id = users.user_id
                        LEFT JOIN 
                            booking_movie_type AS type 
                        ON 
                            movie.movie_type_id = type.movie_type_id
                        WHERE 
                            save.user_id = ${sid}
                        ORDER BY 
                            save.booking_movie_saved_id DESC
                        LIMIT ${(page - 1) * perPage} , ${perPage}`;
            [rows] = await db.query(query);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const movies = rows.map((movie) => {
            if (movie.img) {
                const imageBase64 = Buffer.from(movie.img).toString('base64');
                return {
                    ...movie,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }
            return movie;
        });

        output.success = true;
        output.data = movies;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in collect-movie/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

//收藏 - 刪除電影
collectMovieRouter.delete(
    account.collectMovieDelete,
    authenticate,
    async (req, res) => {
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
            let save_id = req.params.save_id;
            // 1.先確認有無此save_id的存在
            const sql1 =
                'SELECT * FROM booking_movie_saved WHERE booking_movie_saved_id=? ';
            const [rows1] = await db.query(sql1, [save_id]);
            //沒這個save_id return
            if (!rows1.length) {
                output.code = 401;
                output.error = '無收藏此間酒吧';
                return res.json({ output });
            }
            const sql2 = ` DELETE FROM booking_movie_saved WHERE booking_movie_saved_id=? `;
            const [result] = await db.query(sql2, [save_id]);
            //看看有無移除成功
            if (result.affectedRows) {
                output.success = true;
                output.action = 'remove';
                return res.json({ output });
            } else {
                //沒移除成功
                output.code = 410;
                output.error = '無法移除';
                return res.json({ output });
            }
        } catch (error) {
            console.error('Error in deleting post', error);
            output.success = false;
            output.code = 500;
            output.error = '伺服器錯誤';
            res.status(500).json({ success: false, output });
        }
    }
);

export default collectMovieRouter;
