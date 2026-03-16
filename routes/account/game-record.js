import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import authenticate from '../../middlewares/authenticate.js';

const gameRecordRouter = express.Router();

//遊戲 - 紀錄上傳 - 新增 POST
gameRecordRouter.post(account.gameRecordUpload, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功
    let { gameScore, formattedTime } = req.body;

    const output = {
        success: false,
        action: '', // add, remove
        error: '',
        code: 0,
        getPointPlay: false,
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let sid = +req.my_jwt.id || 0;

    try {
        const sql = `INSERT INTO member_game_record (user_id, game_score, game_time) VALUES (?, ?, ?) `;
        const [result] = await db.query(sql, [sid, gameScore, formattedTime]);
        // console.log(!!result.affectedRows);
        if (!result.affectedRows) {
            output.error = '新增記錄失敗';
            return res.json(output);
        } else {
            //今天第一次玩獲得積分:
            const sqlGetFromPlayEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '遊玩遊戲' AND DATE(created_at) = CURDATE() `;
            const [countGetFromPlayEveryday] = await db.query(
                sqlGetFromPlayEveryday,
                [sid]
            );

            if (
                countGetFromPlayEveryday.length > 0 &&
                countGetFromPlayEveryday[0].count > 0
            ) {
                // console.log(
                //     `User ${sid} has already received points from playing today.`
                // );
            } else {
                //今天第一次遊玩，拿到積分
                const sqlSetPointFromLogin = `INSERT INTO member_points_inc (user_id, points_increase, reason, created_at)
                VALUES (?, 10, '遊玩遊戲', NOW());`;
                const [setPoint] = await db.query(sqlSetPointFromLogin, [sid]);
                output.getPointPlay = true;
                // console.log(`User ${sid} get points from playing!!`);
            }
        }

        output.code = 200;
        output.success = !!result.affectedRows;
        res.json(output);
    } catch (error) {
        console.log('game-record-error:', error);
    }
});

export default gameRecordRouter;
