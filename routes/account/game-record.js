import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const gameRecordRouter = express.Router();

//遊戲 - 紀錄上傳 - 新增 POST
gameRecordRouter.post(account.gameRecordUpload, authenticate, async (req, res) => {
    let { gameScore, formattedTime } = req.body;

    const output = {
        success: false,
        action: '',
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
        // 1. 新增遊戲紀錄
        // 注意: schema 中 game_time 是 DateTime @db.Time(0)，
        // formattedTime 需要是有效的 Date 物件或符合格式
        const gameRecord = await prisma.member_game_record.create({
            data: {
                user_id: sid,
                game_score: gameScore,
                game_time: new Date(`1970-01-01T${formattedTime}Z`), // 假設格式為 HH:mm:ss
            }
        });

        if (!gameRecord) {
            output.error = '新增記錄失敗';
            return res.json(output);
        }

        // 2. 檢查今天是否已獲得遊戲積分
        const todayStart = dayjs().startOf('day').toDate();
        const nextDayStart = dayjs().add(1, 'day').startOf('day').toDate();

        const countTodayPlayPoints = await prisma.member_points_inc.count({
            where: {
                user_id: sid,
                reason: '遊玩遊戲',
                created_at: {
                    gte: todayStart,
                    lt: nextDayStart
                }
            }
        });

        if (countTodayPlayPoints === 0) {
            // 今天第一次遊玩，給予積分
            await prisma.member_points_inc.create({
                data: {
                    user_id: sid,
                    points_increase: 10,
                    reason: '遊玩遊戲',
                    created_at: new Date()
                }
            });
            output.getPointPlay = true;
        }

        output.code = 200;
        output.success = true;
        res.json(output);

    } catch (error) {
        console.error('Game Record Upload Error:', error);
        res.status(500).json({ success: false, error: '伺服器內部錯誤' });
    }
});

export default gameRecordRouter;
