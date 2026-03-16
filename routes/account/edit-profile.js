import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import authenticate from '../../middlewares/authenticate.js';

const editProfileRouter = express.Router();

// 編輯-讀取編輯頁面的個人資料API
editProfileRouter.get(account.getEditProfile, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功
    const output = {
        success: false,
        action: '', // add, remove
        error: '',
        code: 0,
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let sid = +req.params.sid || 0;
    // console.log(+req.params.sid)
    const sql = `SELECT user.*,bt.bar_type_name,mt.movie_type,SUM(pi.points_increase) - SUM(DISTINCT pd.points_decrease) AS total_points
    FROM member_user AS user
    LEFT JOIN bar_type AS bt ON user.bar_type_id = bt.bar_type_id
    LEFT JOIN booking_movie_type AS mt ON user.movie_type_id = mt.movie_type_id
    LEFT JOIN member_points_inc AS pi ON user.user_id = pi.user_id
    LEFT JOIN booking_points_dec AS pd ON user.user_id = pd.user_id
    WHERE user.user_id=? `;
    const [rows] = await db.query(sql, [sid]);
    // console.log('編輯讀取: 使用者資料為:=>', rows);

    // 檢查有沒有該筆資料時, 直接跳轉
    const checkSql = `SELECT COUNT(*) AS count FROM member_user WHERE user_id = ?`;
    const [checkResult] = await db.query(checkSql, [sid]);
    if (checkResult[0].count === 0) {
        output.success = false;
        output.code = 440;
        output.error = '沒有該筆資料';
        return res.json(output);
    }

    //處裡時間格式
    if (rows[0].birthday) {
        rows[0].birthday = dayjs(rows[0].birthday).format('YYYY-MM-DD');
    }

    const sqlBarType = `SELECT bar_type_name FROM bar_type `;
    const [rows2] = await db.query(sqlBarType);
    const sqlMovieType = `SELECT movie_type FROM booking_movie_type `;
    const [rows3] = await db.query(sqlMovieType);

    //response DATA
    res.json({
        success: true,
        data: rows[0],
        barType: [rows2],
        movieType: [rows3],
    });
});

// 編輯-編輯個人資料API
editProfileRouter.put(account.editProfile, async (req, res) => {
    let output = {
        success: false,
        bodyData: req.body,
        msg: '',
        errors: '',
    };

    // 查詢類型對照ID - 查詢酒吧類型
    const barTypeQuery = `SELECT bar_type_id FROM bar_type WHERE bar_type_name = '${req.body.fav1}'`;
    const [rows1] = await db.query(barTypeQuery);
    let barTypeId;
    if (rows1 && rows1.length > 0 && rows1[0].bar_type_id) {
        barTypeId = rows1[0].bar_type_id;
    } else {
        barTypeId = 0;
    }
    // 查詢類型對照ID - 查詢酒吧類型
    const movieTypeQuery = `SELECT movie_type_id FROM booking_movie_type WHERE movie_type = '${req.body.fav2}'`;
    const [rows2] = await db.query(movieTypeQuery);
    let movieTypeId;
    if (rows2 && rows2.length > 0 && rows2[0].movie_type_id) {
        movieTypeId = rows2[0].movie_type_id;
    } else {
        movieTypeId = 0;
    }

    //更新資料
    let sid = +req.params.sid || 0;
    const sql = `UPDATE member_user SET email = '${req.body.email}' , username = '${req.body.username}' , gender = '${req.body.gender}' , birthday = '${req.body.birthday}' , mobile = '${req.body.mobile}' , profile_content = '${req.body.profile}' , bar_type_id = '${barTypeId}' , movie_type_id = '${movieTypeId}' WHERE user_id=? `;

    try {
        const [result] = await db.query(sql, [sid]);
        output.success = !!result.changedRows;
        if (result.changedRows) {
            output.msg = '編輯成功';
        } else {
            output.msg = '沒有編輯';
        }
    } catch (error) {
        console.log('error:', error);
    }

    res.json(output);
});

export default editProfileRouter;
