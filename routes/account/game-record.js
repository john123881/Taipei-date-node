import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { createGameRecord } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const gameRecordRouter = express.Router();

// 遊戲 - 上傳紀錄 & 積分發放 API
gameRecordRouter.post(account.gameRecordUpload, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }

    const sid = +req.params.sid || 0;
    const { gameScore, gameTime } = req.body;

    if (typeof gameScore === 'undefined' || gameScore === null || !gameTime) {
        return sendError(res, '缺少必要資訊', 400);
    }

    try {
        const formattedTime = gameTime.length === 5 ? `00:${gameTime}` : gameTime;
        const { gameRecord, getPointPlay } = await createGameRecord(sid, gameScore, formattedTime);

        if (gameRecord) {
            sendSuccess(res, gameRecord, getPointPlay ? '紀錄上傳成功，獲得10積分！' : '紀錄上傳成功', {
                getPointPlay,
            });
        } else {
            sendError(res, '上傳失敗', 400);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default gameRecordRouter;
