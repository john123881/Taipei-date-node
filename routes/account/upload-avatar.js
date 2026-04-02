import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import uploadAws from '../../utils/upload-aws-imgs.js';
import { uploadAvatar } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { uploadAvatarSchema } from '../../schemas/account.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const uploadAvatarRouter = express.Router();

uploadAvatarRouter.post(
    account.uploadAvatar,
    authenticate,
    (req, res, next) => {
        req.uploadFolder = 'avatars';
        next();
    },
    uploadAws.single('avatar'),
    validate(uploadAvatarSchema),
    async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, '請選擇檔案', 400);
        }

        const sid = req.params.sid;
        const result = await uploadAvatar(sid, req.file.location);

        if (result) {
            sendSuccess(res, { location: req.file.location }, '上傳成功');
        } else {
            sendError(res, '上傳失敗', 400);
        }
    } catch (error) {
        console.error('[Route Error] uploadAvatar:', error);
        sendError(res, '伺服器錯誤', 500, error.message);
    }
});

export default uploadAvatarRouter;
