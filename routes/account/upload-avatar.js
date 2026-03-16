import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
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
            // const data = { avatar: req.file.filename };
            // console.log('大頭照上傳data中的data', data);
            console.log('大頭照上傳data中的filename', req.file.location);
            const sql = `UPDATE member_user SET avatar = ? WHERE user_id = ?`;
            const result = await db.query(sql, [req.file.location, sid]);
            output.success = !!result[0].affectedRows;
            output.msg = output.success ? '照片上傳成功' : '照片上傳失敗';
        } else {
            output.msg = '未上傳照片';
        }

        res.json(output);
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, msg: '伺服器錯誤' });
    }
});

export default uploadAvatarRouter;
