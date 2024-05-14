import express from 'express';
import db from '../../utils/mysql2-connect.js';
// 中介軟體，存取隱私會員資料用
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

// 這個 router 的 top level middleware
router.use((req, res, next) => {
    console.log(req.body);
    next();
});

// 更改使用者喜愛的Bar類型
router.put(
    '/user_interest/edit_bar_type/:user_id',
    authenticate,

    async (req, res) => {
        const output = {
            success: false,
            bodyData: req.body,
            msg: '',
            error: '',
        };
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json(output);
        }

        try {
            // 查詢酒吧類型的ID
            const barTypeQuery = `SELECT bar_type_id FROM bar_type WHERE bar_type_name = ?`;
            const [rows] = await db.query(barTypeQuery, [
                req.body.bar_type_name,
            ]);

            // 確認是否成功獲取到酒吧類型的ID
            let barTypeId;
            if (rows.length > 0) {
                barTypeId = rows[0].bar_type_id;
            } else {
                throw new Error('找不到指定的酒吧類型');
            }

            // 從路由參數中獲取用戶ID
            const user_id = +req.params.user_id || 0;

            // 更新用戶的酒吧類型
            const sql =
                'UPDATE `member_user` SET `bar_type_id` = ? WHERE `user_id` = ?';
            const [result] = await db.query(sql, [barTypeId, user_id]);

            // 確認是否有記錄被更改
            if (result.changedRows) {
                output.success = true;
                output.msg = '編輯成功';
            } else {
                output.msg = '沒有編輯';
            }
        } catch (error) {
            output.error = error.message;
        }

        res.json(output);
    }
);

// 更改使用者喜愛的Movie類型
router.put(
    '/user_interest/edit_movie_type/:user_id',
    authenticate,

    async (req, res) => {
        const output = {
            success: false,
            bodyData: req.body,
            msg: '',
            error: '',
        };
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json(output);
        }

        try {
            // 查詢電影類型的ID
            const movieTypeQuery = `SELECT movie_type_id FROM booking_movie_type WHERE movie_type = ?`;
            const [rows] = await db.query(movieTypeQuery, [
                req.body.movie_type,
            ]);

            // 確認是否成功獲取到酒吧類型的ID
            let movieTypeId;
            if (rows.length > 0) {
                movieTypeId = rows[0].movie_type_id;
            } else {
                throw new Error('找不到指定的電影類型');
            }

            // 從路由參數中獲取用戶ID
            const user_id = +req.params.user_id || 0;

            // 更新用戶的酒吧類型
            const sql =
                'UPDATE `member_user` SET `movie_type_id` = ? WHERE `user_id` = ?';
            const [result] = await db.query(sql, [movieTypeId, user_id]);

            // 確認是否有記錄被更改
            if (result.changedRows) {
                output.success = true;
                output.msg = '編輯成功';
            } else {
                output.msg = '沒有編輯';
            }
        } catch (error) {
            output.error = error.message;
        }

        res.json(output);
    }
);

export default router;
