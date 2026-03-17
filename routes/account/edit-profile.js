import express from 'express';
import { account } from '../apiConfig.js';
import authenticate from '../../middlewares/authenticate.js';
import { getProfile, updateProfile, getAllTypes } from '../../services/index.js';

const editProfileRouter = express.Router();

// 編輯-讀取編輯頁面的個人資料API
editProfileRouter.get(account.getEditProfile, authenticate, async (req, res) => {
    const output = {
        success: false,
        action: '',
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

    try {
        const responseData = await getProfile(sid);

        if (!responseData) {
            output.success = false;
            output.code = 440;
            output.error = '沒有該筆資料';
            return res.json(output);
        }

        const { barTypes, movieTypes } = await getAllTypes();

        res.json({
            success: true,
            data: responseData,
            barType: [barTypes],
            movieType: [movieTypes],
        });

    } catch (error) {
        console.error('Edit Profile GET Error:', error);
        res.status(500).json({ success: false, error: '伺服器內部錯誤' });
    }
});

// 編輯-編輯個人資料API
editProfileRouter.put(account.editProfile, async (req, res) => {
    let output = {
        success: false,
        bodyData: req.body,
        msg: '',
        errors: '',
    };

    try {
        let sid = +req.params.sid || 0;
        const updatedUser = await updateProfile(sid, req.body);

        if (updatedUser) {
            output.success = true;
            output.msg = '編輯成功';
        } else {
            output.msg = '沒有編輯';
        }

    } catch (error) {
        console.error('Edit Profile PUT Error:', error);
        output.msg = '編輯失敗';
        output.errors = error.message;
    }

    res.json(output);
});

export default editProfileRouter;
