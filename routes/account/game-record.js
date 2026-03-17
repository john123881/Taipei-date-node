import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { createGameRecord } from '../../services/index.js';

const gameRecordRouter = express.Router();

// 遊戲 - 上傳紀錄 & 積分發放 API
gameRecordRouter.post(account.gameRecordUpload, authenticate, async (req, res) => {

    let output = {
        success: false,
        msg: '',
        error: '',
    };

    if (!req.my_jwt?.id) {
        output.msg = '沒授權';
        return res.json(output);
    }

    const sid = +req.params.sid || 0;
    const { gameScore, gameTime } = req.body;

    if (!gameScore || !gameTime) {
        output.msg = '缺少必要資訊';
        return res.json(output);
    }

    try {
        // 格式化時間 (MM:ss -> HH:mm:ss)
        const formattedTime = req.body.gameTime.length === 5 ? `00:${req.body.gameTime}` : req.body.gameTime;

        const { gameRecord, getPointPlay } = await createGameRecord(sid, gameScore, formattedTime);

        if (gameRecord) {
            output.success = true;
            output.msg = getPointPlay ? '紀錄上傳成功，獲得10積分！' : '紀錄上傳成功';
            output.getPointPlay = getPointPlay;
        } else {
            output.msg = '上傳失敗';
        }

    } catch (error) {
        console.error('Game Record POST Error:', error);
        output.msg = '伺服器錯誤';
        output.error = error.message;
    }

    res.json(output);
});

export default gameRecordRouter;
