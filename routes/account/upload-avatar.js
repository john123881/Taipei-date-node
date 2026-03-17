import express from 'express';
import { account } from '../apiConfig.js';
import uploadAws from '../../utils/upload-aws-imgs.js';
import { uploadAvatar } from '../../services/index.js';

const uploadAvatarRouter = express.Router();

uploadAvatarRouter.post(account.uploadAvatar, uploadAws.single('avatar'), async (req, res) => {
    let output = {
        success: false,
        msg: '',
        error: '',
    };
    try {
        if (!req.file) {
            output.msg = '請選擇檔案';
            return res.json(output);
        }

        const sid = +req.params.sid || 0;
        const result = await uploadAvatar(sid, req.file.location);

        if (result) {
            output.success = true;
            output.msg = '上傳成功';
            output.location = req.file.location;
        } else {
            output.msg = '上傳失敗';
        }

    } catch (error) {
        console.error('Upload Avatar Error:', error);
        output.msg = '伺服器錯誤';
        output.error = error.message;
    }
    res.json(output);
});

export default uploadAvatarRouter;
