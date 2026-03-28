import express from 'express';
import { account } from '../apiConfig.js';
import uploadAws from '../../utils/upload-aws-imgs.js';
import { uploadAvatar } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const uploadAvatarRouter = express.Router();

uploadAvatarRouter.post(account.uploadAvatar, uploadAws.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, '請選擇檔案', 400);
        }

        const sid = +req.params.sid || 0;
        const result = await uploadAvatar(sid, req.file.location);

        if (result) {
            sendSuccess(res, { location: req.file.location }, '上傳成功');
        } else {
            sendError(res, '上傳失敗', 400);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default uploadAvatarRouter;
