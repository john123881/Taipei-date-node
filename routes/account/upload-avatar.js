import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import upload from '../../utils/upload-aws-imgs.js';

const uploadAvatarRouter = express.Router();

// 編輯-大頭照上傳，使用multer
uploadAvatarRouter.post(account.uploadAvatar, upload.single('avatar'), async (req, res) => {
    let output = {
        success: false,
        bodyData: { body: req.body, file: req.file },
        msg: '',
    };

    try {
        if (req.file) {
            let sid = +req.params.sid || 0;
            
            const result = await prisma.member_user.update({
                where: { user_id: sid },
                data: {
                    avatar: req.file.location,
                    updated_at: new Date()
                }
            });

            if (result) {
                output.success = true;
                output.msg = '照片上傳成功';
            } else {
                output.msg = '照片上傳失敗';
            }
        } else {
            output.msg = '未上傳照片';
        }

        res.json(output);
    } catch (e) {
        console.error('Upload Avatar Error:', e);
        res.status(500).json({ success: false, msg: '伺服器錯誤' });
    }
});

export default uploadAvatarRouter;
