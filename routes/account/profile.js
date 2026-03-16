import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import authenticate from '../../middlewares/authenticate.js';

const profileRouter = express.Router();

// 首頁-讀取個人單筆資料 API
// http://localhost:3001/account/1
profileRouter.get(account.getProfile, authenticate, async (req, res) => {
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
    const sql = `SELECT 
    user.*, 
    bt.bar_type_name, 
    mt.movie_type, 
    COALESCE(SUM(pi.points_increase), 0) - COALESCE(SUM(DISTINCT pd.points_decrease), 0) AS total_points 
FROM 
    member_user AS user 
LEFT JOIN 
    bar_type AS bt ON user.bar_type_id = bt.bar_type_id 
LEFT JOIN 
    booking_movie_type AS mt ON user.movie_type_id = mt.movie_type_id 
LEFT JOIN 
    member_points_inc AS pi ON user.user_id = pi.user_id 
LEFT JOIN 
    booking_points_dec AS pd ON user.user_id = pd.user_id 
WHERE 
    user.user_id=?`;
    const [rows] = await db.query(sql, [sid]);
    // console.log([rows]);

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

    //查詢今天有無登入過後獲得積分
    let hasLogin = false;
    const sqlGetFromLoginEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '登入獲得' AND DATE(created_at) = CURDATE() `;
    const [countGetFromLoginEveryday] = await db.query(
        sqlGetFromLoginEveryday,
        [sid]
    );
    if (
        countGetFromLoginEveryday.length > 0 &&
        countGetFromLoginEveryday[0].count > 0
    ) {
        hasLogin = true;
        // console.log(`---User ${sid} receive points for login.`);
    } else {
        // console.log(`----User ${sid} not get points from login yet!!`);
    }

    //查詢今天有無遊戲過後獲得積分
    let hasPlay = false;
    const sqlGetFromPlayEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '遊玩遊戲' AND DATE(created_at) = CURDATE() `;
    const [countGetFromPlayEveryday] = await db.query(sqlGetFromPlayEveryday, [
        sid,
    ]);

    if (
        countGetFromPlayEveryday.length > 0 &&
        countGetFromPlayEveryday[0].count > 0
    ) {
        hasPlay = true;
        // console.log(`---User ${sid} receive points for from playing today.`);
    } else {
        // console.log(`----User ${sid} not get points from playing yet!!`);
    }

    //response DATA
    res.json({
        success: true,
        data: rows[0],
        hasPlay: hasPlay,
        hasLogin: hasLogin,
    });
});

export default profileRouter;
