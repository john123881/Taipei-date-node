import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';

const addDataRouter = express.Router();

//新增假資料
addDataRouter.post(account.addData, async (req, res) => {
    try {
        const dataArray = req.body; // 接收包含物件陣列的請求主體
        const output = {
            success: false,
            error: '',
            code: 0,
            results: [],
        };

        // 遍歷物件陣列，對每個物件進行處理
        for (const data of dataArray) {
            let {
                avatar,
                user_id,
                username,
                email,
                password_hash,
                gender,
                birthday,
                mobile,
                bar_type_id,
                movie_type_id,
                profile_content,
                user_active,
            } = data;

            // 1. 檢查 Email 是否已存在
            const existingEmail = await prisma.member_user.findFirst({
                where: { email: email }
            });
            if (existingEmail) {
                output.error = '已註冊過此電子郵件';
                output.code = 470;
                return res.json(output);
            }

            // 2. 檢查 UserID 是否已存在
            const existingId = await prisma.member_user.findUnique({
                where: { user_id: user_id }
            });
            if (existingId) {
                output.error = '已註冊過此user_id';
                output.code = 471;
                return res.json(output);
            }

            // 3. 執行資料庫寫入
            const newUser = await prisma.member_user.create({
                data: {
                    avatar,
                    username,
                    email,
                    password_hash,
                    gender,
                    birthday: birthday ? new Date(birthday) : null,
                    mobile,
                    bar_type_id,
                    movie_type_id,
                    profile_content,
                    user_active: !!user_active
                }
            });

            output.results.push({
                success: true,
                username: newUser.username,
                email: newUser.email,
            });
        }

        output.success = true;
        return res.json(output);
    } catch (ex) {
        console.error('Add Data Error:', ex);
        return res.status(500).json({
            success: false,
            error: '註冊時發生錯誤: ' + ex.message,
            code: 500,
        });
    }
});

export default addDataRouter;
