import express from 'express';
import db from '../../utils/mysql2-connect.js';
import dayjs from 'dayjs';
import { z } from 'zod';
// 中介軟體，存取隱私會員資料用
import authenticate from '../../middlewares/authenticate.js';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// 這個 router 的 top level middleware
router.use((req, res, next) => {
    next();
});

// 拿取資料庫資料
const getListData = async (req) => {
    const page = +req.query.page || 1;
    const perPage = 25;
    // 拿到總記錄數
    let total_sql = `
    SELECT COUNT(*) AS totalRows
    FROM friendships_message
  `;
    // 對資料庫查詢結果進行解構，
    const [[{ totalRows }]] = await db.query(total_sql);

    // 計算總頁數
    const totalPages = Math.ceil(totalRows / perPage);

    let sql = `
    SELECT
    fm.friendship_id,
    sender.username AS sender_id,
    sender.avatar AS sender_avatar,
    fm.message_id,
    fm.content,
    fm.sended_at
    FROM
    friendships_message AS fm
    LEFT JOIN
    member_user AS sender ON fm.sender_id = sender.user_id
    ORDER BY fm.message_id ASC
    LIMIT ${(page - 1) * perPage}, ${perPage}
  `;

    // 解構賦值，等待直到資料庫結束查詢並返回結果
    const [rows] = await db.query(sql);

    // 處理查詢結果
    const data = rows.map((row) => {
        // 這裡會針對資料進行處理，
        const formattedSendAt = dayjs(row.sended_at).format(
            'YYYY-MM-DD HH:mm:ss'
        );

        return {
            message_id: row.message_id,
            friendship_id: row.friendship_id,
            sender_id: row.sender_id,
            sender_avatar: row.sender_avatar, // 添加 sender_avatar
            content: row.content,
            sended_at: formattedSendAt,
        };
    });

    // 返回處理後的數據
    return {
        success: true,
        totalRows,
        totalPages,
        page,
        perPage,
        data,
    };
};

// 讀取資料，json格式
// http://localhost:3001/date/friendships_message/api
router.get('/friendships_message/api', async (req, res) => {
    const data = await getListData(req);
    res.json(data);
});

// 取得單筆資料 API (拿取共同的friendship_id，依照 message_id 排列)
// http://localhost:3001/date/friendships_message/2
router.get(
    '/friendships_message/:friendship_id',
    authenticate,
    async (req, res) => {
        const output = {
            success: false,
            action: '', // add, remove
            error: '',
            code: 0,
        };
        // console.log(req.my_jwt.id);
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json(output);
        }
        let friendship_id = +req.params.friendship_id || 0;
        const sql = `
    SELECT
      fm.friendship_id,
      sender.username AS sender_id,
      sender.avatar AS sender_avatar,
      fm.message_id,
      fm.msg_type,
      fm.content,
      fm.sended_at
    FROM
      friendships_message AS fm
    LEFT JOIN
      member_user AS sender ON fm.sender_id = sender.user_id
    WHERE fm.friendship_id=?
    ORDER BY fm.message_id ASC 
  `;
        const [rows] = await db.query(sql, [friendship_id]);
        if (!rows.length) {
            // 沒有該筆資料時, 直接跳轉
            return res.json({ success: false, msg: '沒有該筆資料' });
        }

        // 處理時間格式
        const data = rows.map((row) => {
            // 這裡會針對資料進行處理，
            const formattedSendAt = dayjs(row.sended_at).format('HH:mm');

            return {
                ...row,
                sended_at: formattedSendAt,
            };
        });

        res.json({ success: true, data });
    }
);

// 新增一筆紀錄
// http://localhost:3001/date/friendships_message/api
// TODO: 檢查 friendship_id 是否有匹配的 userId
router.post('/friendships_message/api', async (req, res) => {
    console.log('Received request:', req.body); // 輸出收到的請求資料

    const output = {
        success: false,
        bodyData: req.body,
        errors: {},
    };

    // 檢查是否存在必要的屬性
    if (
        !req.body ||
        !req.body.friendship_id ||
        !req.body.sender_id ||
        !req.body.content
    ) {
        output.errors.missingFields = '缺少必要的屬性';
        return res.status(400).json(output); // 返回錯誤狀態碼 400，表示請求無效
    }

    // 欄位資料檢查
    const schemaFriendshipId = z
        .number()
        .int()
        .min(1, { message: 'FriendshipId須為大於等於1的整數' });
    const schemaSenderId = z
        .number()
        .int()
        .min(1, { message: 'SenderId須為大於等於1的整數' });
    const schemaContent = z.string().min(1, { message: 'Content不能為空' });

    const checkFriendshipId = schemaFriendshipId.safeParse(
        req.body.friendship_id
    );
    const checkSenderId = schemaSenderId.safeParse(req.body.sender_id);
    const checkContent = schemaContent.safeParse(req.body.content);

    if (!checkFriendshipId.success) {
        output.errors.friendship_id = checkFriendshipId.error.message;
    }
    if (!checkSenderId.success) {
        output.errors.sender_id = checkSenderId.error.message;
    }
    if (!checkContent.success) {
        output.errors.content = checkContent.error.message;
    }

    // 如果通過了所有檢查，則執行插入資料
    try {
        const friendship_id = req.body.friendship_id;
        const sender_id = req.body.sender_id;
        const content = req.body.content;
        const sended_at = new Date();
        const msg_type = 'T';

        const sql = `INSERT INTO friendships_message (friendship_id, sender_id, msg_type, content, sended_at) VALUES (?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            friendship_id,
            sender_id,
            msg_type,
            content,
            sended_at,
        ]);

        // 處理時間格式
        const formattedSendAt = dayjs(sended_at).format('YYYY-MM-DD HH:mm:ss');

        if (result.affectedRows > 0) {
            output.success = true;
            output.friendship_id = result.insertId;
            output.sender_id = result.sender_id;
            output.content = result.content;
            output.sended_at = formattedSendAt;
        }
    } catch (ex) {
        // // 資料庫錯誤處理
        // console.error("Database query error:", ex);
        // output.errors.database = "資料庫出錯";
    }

    res.json(output);
});

// 新增圖片
// 設定 multer 儲存選項
const storage = multer.diskStorage({
    destination: 'public/messageImage',
    filename: (req, file, cb) => {
        cb(null, file.originalname); // 使用原始文件名
    },
});

const upload = multer({ storage });

router.post(
    '/friendships_message/uploadImg/api',
    upload.single('file'),
    async (req, res) => {
        console.log('Received request:', req.body, 'File:', req.file);

        const output = {
            success: false,
            bodyData: { body: req.body, file: req.file },
            errors: {},
        };

        // 欄位資料檢查
        const schemaFriendshipId = z
            .number()
            .int()
            .min(1, { message: 'FriendshipId須為大於等於1的整數' });
        const schemaSenderId = z
            .number()
            .int()
            .min(1, { message: 'SenderId須為大於等於1的整數' });
        const schemaContent = z.string().min(1, { message: 'Content不能為空' });

        const checkFriendshipId = schemaFriendshipId.safeParse(
            req.body.friendship_id
        );
        const checkSenderId = schemaSenderId.safeParse(req.body.sender_id);
        const checkContent = schemaContent.safeParse(req.body.content);

        if (!checkFriendshipId.success) {
            output.errors.friendship_id = checkFriendshipId.error.message;
        }
        if (!checkSenderId.success) {
            output.errors.sender_id = checkSenderId.error.message;
        }
        if (!checkContent.success) {
            output.errors.content = checkContent.error.message;
        }

        // 如果有圖片，將其 URL 放入 content
        let content = req.body.content || '';
        if (req.file) {
            const imageUrl = `http://localhost:${process.env.WEB_PORT}/messageImage/${req.file.filename}`;
            content += ` ${imageUrl}`; // 在 content 中添加圖片 URL
        }

        // 如果通過了所有檢查，則執行插入資料
        try {
            const friendship_id = req.body.friendship_id;
            const sender_id = req.body.sender_id;
            const sended_at = new Date();
            const msg_type = 'I';

            const sql = `INSERT INTO friendships_message (friendship_id, sender_id, msg_type, content, sended_at) VALUES (?, ?, ?, ?, ?)`;

            const [result] = await db.query(sql, [
                friendship_id,
                sender_id,
                msg_type,
                content,
                sended_at,
            ]);

            // 處理時間格式
            const formattedSendAt = dayjs(sended_at).format(
                'YYYY-MM-DD HH:mm:ss'
            );

            if (result.affectedRows > 0) {
                output.success = true;
                output.friendship_id = result.insertId;
                output.sender_id = result.sender_id;
                output.content = content;
                output.sended_at = formattedSendAt;
            }
        } catch (ex) {
            console.error('Database query error:', ex);
            output.errors.database = '資料庫出錯';
        }

        res.json(output);
    }
);

// TODO: friendships_message 進階功能 => 針對user刪除對話紀錄

// 針對登入使用者，找出朋友的最新一筆的訊息
// http://localhost:3001/date/friendships_message/sender_id/${userid1}
router.get(
    '/friendships_message/sender_id/:user_id',
    authenticate,
    async (req, res) => {
        const output = {
            success: false,
            bodyData: req.body,
            msg: '',
            error: '',
        };
        console.log(req.my_jwt?.id);
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json(output);
        }
        let user_id = +req.params.user_id || 0;
        // 1.外部查詢  2.子查詢  3.WHERE sub.rn = ? -> 確保friendship_id的最新一條訊息。
        // ROW_NUMBER()，為查詢結果中的每一行賦予一個序號。
        // PARTITION BY fm.friendship_id  按照 fm.friendship_id 進行分組，且依照 message_id 進行排序
        const sql = `
        SELECT 
    sub.message_id,
    sub.friendship_id,
    sub.sender_id,
    sub.sender_name,
    sub.content,
    sub.sended_at,
    sub.avatar,
    friends.friend_name AS other_friend_name,
    friends.friend_avatar AS other_friend_avatar,
    friends.other_friend_id,
    friends.friendship_status
FROM (
    SELECT 
        fm.message_id, 
        fm.friendship_id,
        fm.sender_id,
        mu.username AS sender_name,
        fm.content,
        fm.sended_at,
        mu.avatar,
        ROW_NUMBER() OVER (PARTITION BY fm.friendship_id ORDER BY fm.message_id DESC) AS rn  
    FROM 
        friendships_message fm
    JOIN 
        member_user mu 
    ON 
        fm.sender_id = mu.user_id
    WHERE 
        fm.sender_id = ?
) AS sub
JOIN (
    SELECT 
        f.friendship_id,
        CASE 
            WHEN f.user_id1 = ? THEN mu2.username
            ELSE mu1.username
        END AS friend_name,
        CASE 
            WHEN f.user_id1 = ? THEN mu2.avatar
            ELSE mu1.avatar
        END AS friend_avatar,
        CASE 
            WHEN f.user_id1 = ? THEN f.user_id2
            ELSE f.user_id1
        END AS other_friend_id,
        f.friendship_status
    FROM 
        friendships f
    JOIN 
        member_user mu1 
    ON 
        f.user_id1 = mu1.user_id
    JOIN 
        member_user mu2 
    ON 
        f.user_id2 = mu2.user_id
) AS friends
ON sub.friendship_id = friends.friendship_id
WHERE 
    sub.rn = 1  
    AND friends.friendship_status = 'accepted'
ORDER BY 
    sub.message_id DESC;


  `;
        const [rows] = await db.query(sql, [
            user_id,
            user_id,
            user_id,
            user_id,
        ]);
        if (!rows.length) {
            return res.json({ success: false, msg: '沒有該筆資料' });
        }

        const data = rows.map((row) => {
            const formattedSendAt = dayjs(row.sended_at).format('MM-DD HH:mm');
            return {
                message_id: row.message_id,
                friendship_id: row.friendship_id,
                sender_id: row.sender_id,
                sender_name: row.sender_name,
                avatar: row.avatar,
                content: row.content,
                sended_at: formattedSendAt,
                other_friend_id: row.other_friend_id,
                other_friend_name: row.other_friend_name,
                other_friend_avatar: row.other_friend_avatar,
            };
        });

        res.json({ success: true, data });
    }
);

export default router;
