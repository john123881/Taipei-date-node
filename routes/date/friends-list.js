import express from 'express';
import dayjs from 'dayjs';
import { z } from 'zod';
import db from '../../utils/mysql2-connect.js';
// 中介軟體，存取隱私會員資料用
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

// 這個 router 的 top level middleware
router.use((req, res, next) => {
    console.log(req.body);
    next();
});

// 拿取資料庫資料
const getListData = async (req) => {
    const page = +req.query.page || 1;
    const perPage = 25;
    // 拿到總記錄數
    let total_sql = `
    SELECT COUNT(*) AS totalRows
    FROM friendships
  `;
    // 對資料庫查詢結果進行解構，
    const [[{ totalRows }]] = await db.query(total_sql);

    // 計算總頁數
    const totalPages = Math.ceil(totalRows / perPage);

    let sql = `
    SELECT
        f.friendship_id,
        m1.username AS user_id1,
        m2.username AS user_id2,
        m1.avatar AS user_id1_avatar,
        m2.avatar AS user_id2_avatar,
        f.friendship_status,
        f.send_at,
        f.confirmed_at,
        f.updated_at
    FROM
        friendships f
    LEFT JOIN
        member_user m1 ON f.user_id1 = m1.user_id
    LEFT JOIN
        member_user m2 ON f.user_id2 = m2.user_id
    ORDER BY f.friendship_id ASC
    LIMIT ${(page - 1) * perPage}, ${perPage}
  `;
    // ORDER BY friendship_id DESC 從大到小

    // 解構賦值，等待直到資料庫結束查詢並返回結果
    const [rows] = await db.query(sql);

    // 處理查詢結果
    const data = rows.map((row) => {
        // 這裡會針對資料進行處理，
        const formattedSendAt = dayjs(row.send_at).format(
            'YYYY-MM-DD HH:mm:ss'
        );
        const formattedConfirmedAt = dayjs(row.confirmed_at).format(
            'YYYY-MM-DD HH:mm:ss'
        );
        const formattedUpdatedAt = dayjs(row.updated_at).format(
            'YYYY-MM-DD HH:mm:ss'
        );
        return {
            friendship_id: row.friendship_id,
            user_id1: row.user_id1,
            user_id1_avatar: row.user_id1_avatar,
            user_id2: row.user_id2,
            user_id2_avatar: row.user_id2_avatar,
            friendship_status: row.friendship_status,
            send_at: formattedSendAt,
            confirmed_at: formattedConfirmedAt,
            updated_at: formattedUpdatedAt,
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
// http://localhost:3001/date/friends-list/api
router.get('/friends-list/api', async (req, res) => {
    const data = await getListData(req);
    res.json(data);
});

// 取得單筆資料 API
// http://localhost:3001/date/friends-list/${friendship_id}
// http://localhost:3001/date/friends-list/10
router.get('/friends-list/:friendship_id', authenticate, async (req, res) => {
    const output = {
        success: false,
        bodyData: req.body,
        msg: '',
        error: '',
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }
    let friendship_id = +req.params.friendship_id || 0;
    const sql = `SELECT
        f.friendship_id,
        m1.username AS user_id1,
        m1.avatar AS user_id1_avatar,
        m2.username AS user_id2,
        m2.avatar AS user_id2_avatar,
        f.friendship_status,
        f.send_at,
        f.confirmed_at,
        f.updated_at
    FROM
        friendships f
    LEFT JOIN
        member_user m1 ON f.user_id1 = m1.user_id
    LEFT JOIN
        member_user m2 ON f.user_id2 = m2.user_id
    WHERE friendship_id=? `;
    const [rows] = await db.query(sql, [friendship_id]);
    if (!rows.length) {
        // 沒有該筆資料時, 直接跳轉。
        return res.json({ success: false, msg: '沒有該筆資料' });
    }

    // 處理時間格式
    const formattedSendAt = dayjs(rows[0].send_at).format(
        'YYYY-MM-DD HH:mm:ss'
    );
    const formattedConfirmedAt = dayjs(rows[0].confirmed_at).format(
        'YYYY-MM-DD HH:mm:ss'
    );
    const formattedUpdatedAt = dayjs(rows[0].updated_at).format(
        'YYYY-MM-DD HH:mm:ss'
    );

    // 將處理後的時間欄位更新到查詢結果中
    const data = {
        ...rows[0],
        send_at: formattedSendAt,
        confirmed_at: formattedConfirmedAt,
        updated_at: formattedUpdatedAt,
    };

    res.json({ success: true, data });
});

// 刪除單筆資料 （應該用不到）
// http://localhost:3001/date/friends-list/308
router.delete('/friends-list/:friendship_id', async (req, res) => {
    // 由參數中獲取 friendship_id，即要更新的資源的唯一標識符。如果無法將 friendship_id 轉換為數字，則將 friendship_id 設置為 0
    let friendship_id = +req.params.friendship_id || 0;

    // 用於保存處理結果
    const output = {
        success: false,
        friendship_id,
        user_id1: null,
        user_id2: null,
        friendship_status: null,
    };

    if (friendship_id >= 1) {
        // 先查詢 friendship_id table
        const sql = `SELECT user_id1, user_id2, friendship_status FROM friendships WHERE friendship_id=${friendship_id}`;
        const [rows] = await db.query(sql);

        // 判斷是否有資料被返回
        if (rows.length > 0) {
            // 用解構賦值的方式將提取的值分配給對應的變數
            const { user_id1, user_id2, friendship_status } = rows[0];
            output.user_id1 = user_id1;
            output.user_id2 = user_id2;
            output.friendship_status = friendship_status;

            const deleteSql = `DELETE FROM friendships WHERE friendship_id=${friendship_id}`;
            const [result] = await db.query(deleteSql);
            output.success = !!result.affectedRows;
        } else {
            output.error = 'Friendship is not found.';
        }
    }

    res.json(output);
});

// 新增一筆資料 (要確認friendship_id是否重複)
// http://localhost:3001/date/friends-list/ (Content-Type:application/json:body:row)
router.post('/friends-list/', authenticate, async (req, res) => {
    console.log('Received request:', req.body); // 輸出收到的請求資料

    const output = {
        success: false,
        bodyData: req.body,
        errors: {},
    };

    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    // 檢查是否存在必要的屬性
    if (
        !req.body ||
        !req.body.user_id1 ||
        !req.body.user_id2 ||
        !req.body.friendship_status
    ) {
        output.errors.missingFields = '缺少必要的屬性';
        return res.status(400).json(output); // 返回錯誤狀態碼 400，表示請求無效
    }

    // 欄位資料檢查
    const schemaUserId1 = z
        .number()
        .int()
        .min(1, { message: 'UserId須為大於等於1的整數' });
    const schemaUserId2 = z
        .number()
        .int()
        .min(1, { message: 'UserId須為大於等於1的整數' });
    const schemaFriendshipStatus = z
        .string()
        .min(1, { message: 'Friendship Status不能為空' });

    const checkUserId1 = schemaUserId1.safeParse(req.body.user_id1);
    const checkUserId2 = schemaUserId2.safeParse(req.body.user_id2);
    const checkFriendshipStatus = schemaFriendshipStatus.safeParse(
        req.body.friendship_status
    );

    if (!checkUserId1.success) {
        output.errors.user_id1 = checkUserId1.error.message;
    }
    if (!checkUserId2.success) {
        output.errors.user_id2 = checkUserId2.error.message;
    }
    if (!checkFriendshipStatus.success) {
        output.errors.friendship_status = checkFriendshipStatus.error.message;
    }

    // 如果通過了所有檢查，則執行插入資料
    try {
        const user_id1 = req.body.user_id1;
        const user_id2 = req.body.user_id2;
        const friendship_status = req.body.friendship_status;
        const send_at = new Date();
        const confirmed_at = null; // confirmed_at 暫時設為空值
        const updated_at = null; // updated_at 暫時設為空值

        // 查詢是否已經存在相同的 friendship_id
        const checkDuplicateQuery = `SELECT friendship_id FROM friendships WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`;
        const [duplicateResult] = await db.query(checkDuplicateQuery, [
            user_id1,
            user_id2,
            user_id2,
            user_id1,
        ]);

        if (duplicateResult.length > 0) {
            output.errors.duplicate =
                'user_id1 和 user_id2 已經有共同的 friendship_id';
        } else {
            const sql = `INSERT INTO friendships (user_id1, user_id2, friendship_status, send_at, confirmed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;

            const [result] = await db.query(sql, [
                user_id1,
                user_id2,
                friendship_status,
                send_at,
                confirmed_at,
                updated_at,
            ]);

            // 處理時間格式
            const formattedSendAt = dayjs(send_at).format(
                'YYYY-MM-DD HH:mm:ss'
            );

            if (result.affectedRows > 0) {
                output.success = true;
                output.friendship_id = result.insertId;
                output.send_at = formattedSendAt;
                output.confirmed_at = confirmed_at;
                output.updated_at = updated_at;
            }
        }
    } catch (ex) {
        // // 資料庫錯誤處理
        // console.error("Database query error:", ex);
        // output.errors.database = "資料庫出錯";
    }

    res.json(output);
});

// 修改一筆資料 (特別針對status)
// http://localhost:3001/date/friends-list/edit/
router.put('/friends-list/edit/:friendship_id', async (req, res) => {
    const output = {
        success: false,
        bodyData: req.body,
        error: '',
    };

    const friendship_id = +req.params.friendship_id || 0; // 從路由參數中獲取 friendship_id
    const { friendship_status } = req.body; // 從body獲取新的 friendship_status

    // TODO: 如果 friendship_id 和 user_id1,user_id2 對不上要跳出對應error

    const sql =
        'UPDATE `friendships` SET `friendship_status`=? WHERE `friendship_id`=? ';

    try {
        const [result] = await db.query(sql, [
            friendship_status,
            friendship_id,
        ]);
        if (result.changedRows === 0) {
            output.error = '未進行任何變更'; // 如果friendship_status沒有變更
        } else {
            output.success = true;
            output.friendship_id = friendship_id; // 將 friendship_id 增加到輸出中
        }
    } catch (ex) {
        output.error = ex.toString();
    }

    res.json(output);
});

// 取得user(user1,user2都要檢查)的好友且狀態要是accepted
// http://localhost:3001/date/friends-list/accepted/1
router.get(
    '/friends-list/accepted/:user_id',
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
        let user_id = +req.params.user_id || 0;
        const sql = `
            SELECT
            f.friendship_id,
            f.user_id1,
            m1.username AS user_id1_name,
            m1.avatar AS user_id1_avatar,
            f.user_id2,
            m2.username AS user_id2_name,
            m2.avatar AS user_id2_avatar,
            f.friendship_status,
            f.send_at,
            f.confirmed_at,
            f.updated_at
        FROM
            friendships f
        LEFT JOIN
            member_user m1 ON f.user_id1 = m1.user_id
        LEFT JOIN
            member_user m2 ON f.user_id2 = m2.user_id
        WHERE 
            (f.user_id1 = ? OR f.user_id2 = ?)
        AND 
            f.friendship_status = 'accepted'
        ORDER BY 
            f.friendship_id;
        `;
        // 第二個陣列，用於 SQL 的兩個站位符號。
        const [rows] = await db.query(sql, [user_id, user_id]);
        if (!rows.length) {
            // 沒有符合條件的資料時，返回錯誤消息
            return res.json({ success: false, msg: '沒有符合條件的資料' });
        }

        // 處理時間格式
        const data = rows.map((row) => {
            const formattedSendAt = dayjs(row.send_at).format(
                'YYYY-MM-DD HH:mm:ss'
            );
            const formattedConfirmedAt = dayjs(row.confirmed_at).format(
                'YYYY-MM-DD HH:mm:ss'
            );
            const formattedUpdatedAt = dayjs(row.updated_at).format(
                'YYYY-MM-DD HH:mm:ss'
            );
            return {
                ...row,
                send_at: formattedSendAt,
                confirmed_at: formattedConfirmedAt,
                updated_at: formattedUpdatedAt,
            };
        });

        res.json({ success: true, data });
    }
);

// 取得user(篩選興趣找朋友，排除自己的id)
// http://localhost:3001/date/friends-list/{user_id}/{bar_type_id}/{movie_type_id}
router.get(
    '/friends-list/:user_id/:bar_type_id/:movie_type_id',
    authenticate,
    async (req, res) => {
        let user_id = +req.params.user_id || 0;
        let bar_type_id = +req.params.bar_type_id || 0;
        let movie_type_id = +req.params.movie_type_id || 0;
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json(output);
        }
        const sql = `
   SELECT 
    m.user_id, 
    m.username, 
    m.email, 
    m.avatar, 
    m.gender, 
    m.user_active,
    m.birthday, 
    YEAR(CURRENT_DATE()) - YEAR(m.birthday) - (RIGHT(CURRENT_DATE(), 5) < RIGHT(m.birthday, 5)) AS age,
    b.bar_type_id, 
    b.bar_type_name, 
    bt.movie_type_id, 
    bt.movie_type,
    m.profile_content
FROM 
    member_user m
JOIN 
    bar_type b ON m.bar_type_id = b.bar_type_id
JOIN 
    booking_movie_type bt ON m.movie_type_id = bt.movie_type_id
LEFT JOIN 
    friendships f ON (f.user_id1 = m.user_id OR f.user_id2 = m.user_id)
WHERE 
    m.bar_type_id = ? 
    AND m.movie_type_id = ?
    AND m.user_id != ? 
    AND f.friendship_id IS NULL
  `;
        // 第二個陣列，用於 SQL 的兩個站位符號。
        const [rows] = await db.query(sql, [
            bar_type_id,
            movie_type_id,
            user_id,
        ]);
        if (!rows.length) {
            // 沒有符合條件的資料時，返回錯誤消息
            return res.json({ success: false, msg: '沒有符合條件的資料' });
        }

        // 處理時間格式
        const data = rows.map((row) => {
            return {
                ...row,
            };
        });

        res.json({ success: true, data });
    }
);

export default router;
