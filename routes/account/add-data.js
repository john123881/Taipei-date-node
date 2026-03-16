import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';

const addDataRouter = express.Router();

//新增假資料
addDataRouter.post(account.addData, async (req, res) => {
    try {
        const dataArray = req.body; // 接收包含物件陣列的請求主體
        const output = {
            success: false,
            error: '', //錯誤消息存在這裡
            code: 0,
            results: [], // 存放每個物件的處理結果
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

            // 對照資料庫，有無此筆email
            const sql = 'SELECT * FROM member_user WHERE email = ? ';
            const [rows] = await db.query(sql, [email]);
            if (rows.length) {
                output.error = '已註冊過此電子郵件';
                output.code = 470;
                return res.json(output);
            }

            // 對照資料庫，有無此筆user_id
            const sql_id = 'SELECT * FROM member_user WHERE user_id = ? ';
            const [rows_id] = await db.query(sql_id, [user_id]);
            if (rows_id.length) {
                output.error = '已註冊過此user_id';
                output.code = 471;
                return res.json(output);
            }

            // 執行資料庫寫入
            const sql2 = `INSERT INTO member_user 
            (avatar, username, email, password_hash, gender, birthday, mobile, bar_type_id, movie_type_id, profile_content) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) `;
            const [result] = await db.query(sql2, [
                avatar,
                username,
                email,
                password_hash,
                gender,
                birthday,
                mobile,
                bar_type_id,
                movie_type_id,
                profile_content,
            ]);
            console.log('完成SQL query:', result);

            output.results.push({
                // 將處理結果加入到 output 中
                success: true,
                username,
                email,
            });
        }

        output.success = true;
        return res.json(output);
    } catch (ex) {
        console.log('錯誤:' + ex);
        const output = {
            success: false,
            error: '註冊時發生錯誤',
            code: 500,
        };
        return res.json(output);
    }
});

export default addDataRouter;
