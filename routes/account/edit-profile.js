import express from 'express';
import dayjs from 'dayjs';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

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
        const user = await prisma.member_user.findUnique({
            where: { user_id: sid },
            include: {
                bar_type: true,
                movie_type: true,
                member_points_inc: {
                    select: { points_increase: true }
                },
                booking_points_dec: {
                    select: { points_decrease: true }
                }
            }
        });

        if (!user) {
            output.success = false;
            output.code = 440;
            output.error = '沒有該筆資料';
            return res.json(output);
        }

        const totalPointsInc = user.member_points_inc.reduce((sum, item) => sum + item.points_increase, 0);
        const totalPointsDec = user.booking_points_dec.reduce((sum, item) => sum + item.points_decrease, 0);
        const total_points = totalPointsInc - totalPointsDec;

        const responseData = {
            ...user,
            bar_type_name: user.bar_type?.bar_type_name || null,
            movie_type: user.movie_type?.movie_type || null,
            total_points: total_points,
            birthday: user.birthday ? dayjs(user.birthday).format('YYYY-MM-DD') : null
        };

        const barTypes = await prisma.bar_type.findMany({
            select: { bar_type_name: true }
        });

        const movieTypes = await prisma.booking_movie_type.findMany({
            select: { movie_type: true }
        });

        res.json({
            success: true,
            data: responseData,
            barType: [barTypes], // 維持原本回傳格式 [ [{name}, {name}] ]
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
        // 1. 查詢類型對照ID
        const barType = await prisma.bar_type.findFirst({
            where: { bar_type_name: req.body.fav1 }
        });
        const barTypeId = barType ? barType.bar_type_id : 0;

        const movieType = await prisma.booking_movie_type.findFirst({
            where: { movie_type: req.body.fav2 }
        });
        const movieTypeId = movieType ? movieType.movie_type_id : 0;

        // 2. 更新資料
        let sid = +req.params.sid || 0;
        
        const updatedUser = await prisma.member_user.update({
            where: { user_id: sid },
            data: {
                email: req.body.email,
                username: req.body.username,
                gender: req.body.gender,
                birthday: req.body.birthday ? new Date(req.body.birthday) : null,
                mobile: req.body.mobile,
                profile_content: req.body.profile,
                bar_type_id: barTypeId,
                movie_type_id: movieTypeId,
                updated_at: new Date()
            }
        });

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
