import express from 'express';
import dayjs from 'dayjs';
import db from '../utils/mysql2-connect.js';
import upload from '../utils/upload-imgs.js';
import bcrypt from 'bcryptjs';

// 中介軟體，存取隱私會員資料用
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.use((req, res, next) => {
    next();
});

//新增假資料
router.post('/add-data', async (req, res) => {
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

            // 做相應的資料庫查詢和處理
            // 這裡的程式碼和原始的程式碼一樣，只是現在是在迴圈中處理一個物件而不是單個物件

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

// 首頁-讀取個人單筆資料 API
// http://localhost:3001/account/1
router.get('/:sid', authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功
    const output = {
        success: false,
        action: '', // add, remove
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
    // console.log(+req.params.sid)
    const sql = `SELECT 
    user.*, 
    bt.bar_type_name, 
    mt.movie_type, 
    COALESCE(SUM(pi.points_increase), 0) - COALESCE(SUM(DISTINCT pd.points_decrease), 0) AS total_points 
FROM 
    member_user AS user 
LEFT JOIN 
    bar_type AS bt ON user.bar_type_id = bt.bar_type_id 
LEFT JOIN 
    booking_movie_type AS mt ON user.movie_type_id = mt.movie_type_id 
LEFT JOIN 
    member_points_inc AS pi ON user.user_id = pi.user_id 
LEFT JOIN 
    booking_points_dec AS pd ON user.user_id = pd.user_id 
WHERE 
    user.user_id=?`;
    const [rows] = await db.query(sql, [sid]);
    // console.log([rows]);

    // 檢查有沒有該筆資料時, 直接跳轉
    const checkSql = `SELECT COUNT(*) AS count FROM member_user WHERE user_id = ?`;
    const [checkResult] = await db.query(checkSql, [sid]);
    if (checkResult[0].count === 0) {
        output.success = false;
        output.code = 440;
        output.error = '沒有該筆資料';
        return res.json(output);
    }

    //處裡時間格式
    if (rows[0].birthday) {
        rows[0].birthday = dayjs(rows[0].birthday).format('YYYY-MM-DD');
    }

    //查詢今天有無登入過後獲得積分
    let hasLogin = false;
    const sqlGetFromLoginEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '登入獲得' AND DATE(created_at) = CURDATE() `;
    const [countGetFromLoginEveryday] = await db.query(
        sqlGetFromLoginEveryday,
        [sid]
    );
    if (
        countGetFromLoginEveryday.length > 0 &&
        countGetFromLoginEveryday[0].count > 0
    ) {
        hasLogin = true;
        // console.log(`---User ${sid} receive points for login.`);
    } else {
        // console.log(`----User ${sid} not get points from login yet!!`);
    }

    //查詢今天有無遊戲過後獲得積分
    let hasPlay = false;
    const sqlGetFromPlayEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '遊玩遊戲' AND DATE(created_at) = CURDATE() `;
    const [countGetFromPlayEveryday] = await db.query(sqlGetFromPlayEveryday, [
        sid,
    ]);

    if (
        countGetFromPlayEveryday.length > 0 &&
        countGetFromPlayEveryday[0].count > 0
    ) {
        hasPlay = true;
        // console.log(`---User ${sid} receive points for from playing today.`);
    } else {
        // console.log(`----User ${sid} not get points from playing yet!!`);
    }

    //response DATA
    res.json({
        success: true,
        data: rows[0],
        hasPlay: hasPlay,
        hasLogin: hasLogin,
    });
});

// 編輯-讀取編輯頁面的個人資料API
router.get('/edit/:sid', authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功
    const output = {
        success: false,
        action: '', // add, remove
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
    // console.log(+req.params.sid)
    const sql = `SELECT user.*,bt.bar_type_name,mt.movie_type,SUM(pi.points_increase) - SUM(DISTINCT pd.points_decrease) AS total_points
    FROM member_user AS user
    LEFT JOIN bar_type AS bt ON user.bar_type_id = bt.bar_type_id
    LEFT JOIN booking_movie_type AS mt ON user.movie_type_id = mt.movie_type_id
    LEFT JOIN member_points_inc AS pi ON user.user_id = pi.user_id
    LEFT JOIN booking_points_dec AS pd ON user.user_id = pd.user_id
    WHERE user.user_id=? `;
    const [rows] = await db.query(sql, [sid]);
    // console.log('編輯讀取: 使用者資料為:=>', rows);

    // 檢查有沒有該筆資料時, 直接跳轉
    const checkSql = `SELECT COUNT(*) AS count FROM member_user WHERE user_id = ?`;
    const [checkResult] = await db.query(checkSql, [sid]);
    if (checkResult[0].count === 0) {
        output.success = false;
        output.code = 440;
        output.error = '沒有該筆資料';
        return res.json(output);
    }

    //處裡時間格式
    if (rows[0].birthday) {
        rows[0].birthday = dayjs(rows[0].birthday).format('YYYY-MM-DD');
    }

    const sqlBarType = `SELECT bar_type_name FROM bar_type `;
    const [rows2] = await db.query(sqlBarType);
    const sqlMovieType = `SELECT movie_type FROM booking_movie_type `;
    const [rows3] = await db.query(sqlMovieType);

    //response DATA
    res.json({
        success: true,
        data: rows[0],
        barType: [rows2],
        movieType: [rows3],
    });
});

// 編輯-編輯個人資料API
router.put(`/edit/:sid`, async (req, res) => {
    let output = {
        success: false,
        bodyData: req.body,
        msg: '',
        errors: '',
    };

    // 查詢類型對照ID - 查詢酒吧類型
    const barTypeQuery = `SELECT bar_type_id FROM bar_type WHERE bar_type_name = '${req.body.fav1}'`;
    const [rows1] = await db.query(barTypeQuery);
    let barTypeId;
    if (rows1 && rows1.length > 0 && rows1[0].bar_type_id) {
        barTypeId = rows1[0].bar_type_id;
    } else {
        barTypeId = 0;
    }
    // 查詢類型對照ID - 查詢酒吧類型
    const movieTypeQuery = `SELECT movie_type_id FROM booking_movie_type WHERE movie_type = '${req.body.fav2}'`;
    const [rows2] = await db.query(movieTypeQuery);
    let movieTypeId;
    if (rows2 && rows2.length > 0 && rows2[0].movie_type_id) {
        movieTypeId = rows2[0].movie_type_id;
    } else {
        movieTypeId = 0;
    }

    //更新資料
    let sid = +req.params.sid || 0;
    const sql = `UPDATE member_user SET email = '${req.body.email}' , username = '${req.body.username}' , gender = '${req.body.gender}' , birthday = '${req.body.birthday}' , mobile = '${req.body.mobile}' , profile_content = '${req.body.profile}' , bar_type_id = '${barTypeId}' , movie_type_id = '${movieTypeId}' WHERE user_id=? `;

    try {
        const [result] = await db.query(sql, [sid]);
        output.success = !!result.changedRows;
        if (result.changedRows) {
            output.msg = '編輯成功';
        } else {
            output.msg = '沒有編輯';
        }
    } catch (error) {
        console.log('error:', error);
    }

    res.json(output);
});

// 編輯-大頭照上傳，使用multer
router.post('/try-upload/:sid', upload.single('avatar'), async (req, res) => {
    let output = {
        success: false,
        bodyData: { body: req.body, file: req.file },
        msg: '',
    };

    try {
        if (req.file) {
            let sid = +req.params.sid || 0;
            const data = { avatar: req.file.filename };
            const sql = `UPDATE member_user SET avatar = ? WHERE user_id = ?`;
            const result = await db.query(sql, [
                `http://localhost:${process.env.WEB_PORT}/avatar/${data.avatar}`,
                sid,
            ]);
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

// 更改密碼API
router.put(`/change-password/:sid`, authenticate, async (req, res) => {
    let output = {
        success: false,
        action: '', // add, remove
        data: {
            password: '',
            newPassword: '',
            confirmNewPassword: '',
        },
        msg: '',
        error: '',
        code: 0,
    };

    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let { password, newPassword, confirmNewPassword } = req.body;

    if (!password || !newPassword || !confirmNewPassword) {
        output.error = '請填入資訊';
        output.code = 400;
        return res.json(output);
    }

    //做驗證，頭尾去掉空白
    password = password.trim();
    newPassword = newPassword.trim();
    confirmNewPassword = confirmNewPassword.trim();

    // 新舊密碼對照確認
    const sql = 'SELECT * FROM member_user WHERE user_id = ? ';
    const [rows] = await db.query(sql, [req.my_jwt.id]);
    if (!rows.length) {
        //rows沒有長度，代表沒此email，輸出420
        output.error = '無此使用者ID';
        output.code = 420;
        return res.json(output);
    }

    //判斷舊密碼輸入正確與否
    const result = await bcrypt.compare(password, rows[0].password_hash);
    if (!result) {
        output.error = '舊密碼有誤';
        output.code = 450;
        return res.json(output);
    }

    //判斷新舊密碼是否一樣
    if (password === newPassword) {
        output.error = '新密碼不可與舊密碼相同';
        output.code = 455;
        return res.json(output);
    }

    // 更新密碼
    if (newPassword === confirmNewPassword) {
        //新密碼生成HASH
        const newPassword_hash = await bcrypt.hash(newPassword, 12);

        const sql2 = `UPDATE member_user SET password_hash = '${newPassword_hash}' WHERE user_id=? `;
        try {
            const [result] = await db.query(sql2, [req.my_jwt.id]);
            // console.log('db.query.result:', [result]);
            output.success = !!result.changedRows;
            if (result.changedRows) {
                output.msg = '密碼更改成功';
            } else {
                output.msg = '密碼未更改';
            }
        } catch (error) {
            console.log('error:', error);
        }
    }

    res.json(output);
});

//遊戲 - 紀錄上傳 - 新增 POST
router.post('/game-record-upload/:sid', authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功
    let { gameScore, formattedTime } = req.body;

    const output = {
        success: false,
        action: '', // add, remove
        error: '',
        code: 0,
        getPointPlay: false,
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }

    let sid = +req.my_jwt.id || 0;

    try {
        const sql = `INSERT INTO member_game_record (user_id, game_score, game_time) VALUES (?, ?, ?) `;
        const [result] = await db.query(sql, [sid, gameScore, formattedTime]);
        // console.log(!!result.affectedRows);
        if (!result.affectedRows) {
            output.error = '新增記錄失敗';
            return res.json(output);
        } else {
            //今天第一次玩獲得積分:
            const sqlGetFromPlayEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '遊玩遊戲' AND DATE(created_at) = CURDATE() `;
            const [countGetFromPlayEveryday] = await db.query(
                sqlGetFromPlayEveryday,
                [sid]
            );

            if (
                countGetFromPlayEveryday.length > 0 &&
                countGetFromPlayEveryday[0].count > 0
            ) {
                // console.log(
                //     `User ${sid} has already received points from playing today.`
                // );
            } else {
                //今天第一次遊玩，拿到積分
                const sqlSetPointFromLogin = `INSERT INTO member_points_inc (user_id, points_increase, reason, created_at)
                VALUES (?, 10, '遊玩遊戲', NOW());`;
                const [setPoint] = await db.query(sqlSetPointFromLogin, [sid]);
                output.getPointPlay = true;
                // console.log(`User ${sid} get points from playing!!`);
            }
        }

        output.code = 200;
        output.success = !!result.affectedRows;
        res.json(output);
    } catch (error) {
        console.log('game-record-error:', error);
    }
});

//紀錄 - 積分列表
router.get('/record-point/:sid', authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        // console.log('myjwt record point:', req.my_jwt);
        // console.log('(query string來的參數)req.query:', req.query);
        // req.query: { page: '3', sid: '1', pointSource: '遊戲獲得' }
        // console.log('(動態路由)req.params:', req.params);
        // req.params: { sid: '1' }

        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }

        if (req.my_jwt?.id != req.params.sid) {
            output.success = false;
            output.code = 430;
            output.error = 'UserID不匹配';
            return res.json({ output });
        }
        // console.log('UserID匹配成功');

        let sid = req.my_jwt?.id || 0;

        let page = +req.query.page || 1;

        let where = ' WHERE 1 ';
        // console.log('where:', where);

        let source = req.query.selectedValue || '';
        // console.log('判斷前的 source:', source);

        if (source === '登入獲得' || source === '遊玩遊戲') {
            const sourceEsc = db.escape(source);
            where += ` AND ( \`reason\` LIKE ${sourceEsc}  )`;
        }
        // console.log('判斷後的 source:', where);

        // let keyword = req.query.keyword || '';

        // if (keyword) {
        //     const keywordEsc = db.escape('%' + keyword + '%');
        //     where += ` AND ( \`reason\` LIKE ${keywordEsc}  )`;
        // }

        // if (keyword) {
        //     // where += ` AND ab. \`name\` LIKE '%${keyword}%' `; // 錯誤的寫法會有 SQL injection 的問題
        //     const keywordEsc = db.escape('%' + keyword + '%');
        //     // where += ` AND \`name\` LIKE ${keywordEsc} `; //單一SEARCH
        //     where += ` AND ( \`reason\` LIKE ${keywordEsc}  )`;
        // }

        //日期篩選
        const dateFormat = 'YYYY/MM/DD';
        let date_begin = req.query.date_begin || '';
        let date_end = req.query.date_end || '';

        if (dayjs(date_begin, dateFormat, true).isValid()) {
            date_begin = dayjs(date_begin).format(dateFormat);
        } else {
            date_begin = '';
        }
        if (dayjs(date_end, dateFormat, true).isValid()) {
            date_end = dayjs(date_end).add(1, 'day').format(dateFormat);
        } else {
            date_end = '';
        }

        //日期SQL語法新增到where
        if (date_begin) {
            where += ` AND \`created_at\` >=  '${date_begin}' `;
        }
        if (date_end) {
            where += ` AND \`created_at\` <=  '${date_end}' `;
        }

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
            // console.log('輸入頁面小於1，qp:', qp);
            return res.redirect(redirectUrl); // 執行重定向
        }

        const perPage = 10;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM member_points_inc ${where} AND user_id = ${sid}`;
        // console.log('總筆數的SQL語法是:', total_sql_point);
        const [[{ totalRows }]] = await db.query(total_sql_point);
        // console.log('總筆數是:', totalRows);

        let rows = [];
        let totalPages = 0;
        if (totalRows > 0) {
            //計算總頁數，並且判斷當前頁面有無超過總頁數，有的話跳轉到最後一頁
            totalPages = Math.ceil(totalRows / perPage);

            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
                // console.log('輸入頁面超過總頁數了，qp:', qp);
                // console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl); // 執行重定向
            }
            // console.log('總頁數為:', totalPages);
            // console.log('經判斷過後的頁面:', page);

            let sort = req.query.sortDate || 'DESC';
            // console.log('目前日期排序方向:', sort);

            //放入SQL
            const sqlPoint = `SELECT * 
            FROM member_points_inc 
            ${where} AND user_id=${sid} 
            ORDER BY created_at ${sort} 
            LIMIT ${(page - 1) * perPage} , ${perPage}`;
            // console.log('最後執行索取資料的SQL語法:', sqlPoint);
            [rows] = await db.query(sqlPoint);
        }
        // console.log('跟DB要的數據:', [rows]);

        // const sqlPoint = `SELECT * FROM member_points_inc WHERE user_id=?`;
        // const [rowsPoint] = await db.query(sqlPoint, [sid]);
        // console.log([rowsPoint]);

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無相關紀錄';
            output.data = [];
            return res.json({ success: false, output });
        }

        //將日期轉成YYYY/MM/DD
        const formattedRowsPoint = rows.map((row, i) => ({
            ...row,
            created_at: dayjs(row.created_at).format(dateFormat),
        }));

        output.success = true;
        output.data = formattedRowsPoint;
        output.code = 200;
        res.json({
            success: true,
            sid,
            totalRows,
            page,
            totalPages,
            perPage,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in /record-point/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

//紀錄 - 遊戲列表
router.get('/record-game/:sid', authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        // console.log('myjwt record point:', req.my_jwt);
        // console.log('(query string來的參數)req.query:', req.query);
        // req.query: { page: '3', sid: '1', pointSource: '遊戲獲得' }
        // console.log('(動態路由)req.params:', req.params);
        // req.params: { sid: '1' }

        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }

        if (req.my_jwt?.id != req.params.sid) {
            output.success = false;
            output.code = 430;
            output.error = 'UserID不匹配';
            return res.json({ output });
        }

        let sid = req.my_jwt?.id || 0;

        let page = +req.query.page || 1;

        let where = ' WHERE 1 ';

        //日期篩選
        const dateFormat = 'YYYY/MM/DD';
        let date_begin = req.query.date_begin || '';
        let date_end = req.query.date_end || '';

        if (dayjs(date_begin, dateFormat, true).isValid()) {
            date_begin = dayjs(date_begin).format(dateFormat);
        } else {
            date_begin = '';
        }
        if (dayjs(date_end, dateFormat, true).isValid()) {
            date_end = dayjs(date_end).add(1, 'day').format(dateFormat);
        } else {
            date_end = '';
        }

        //日期SQL語法新增到where
        if (date_begin) {
            where += ` AND \`created_at\` >=  '${date_begin}' `;
        }
        if (date_end) {
            where += ` AND \`created_at\` <=  '${date_end}' `;
        }

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
            // console.log('輸入頁面小於1，qp:', qp);
            return res.redirect(redirectUrl); // 執行重定向
        }

        const perPage = 10;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM member_game_record ${where} AND user_id = ${sid}`;
        // console.log('總筆數的SQL語法是:', total_sql_point);
        const [[{ totalRows }]] = await db.query(total_sql_point);
        // console.log('總筆數是:', totalRows);

        let rows = [];
        let totalPages = 0;
        //計算總頁數，並且判斷當前頁面有無超過總頁數，有的話跳轉到最後一頁
        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
                // console.log('輸入頁面超過總頁數了，qp:', qp);
                // console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl); // 執行重定向
            }
            // console.log('總頁數為:', totalPages);
            // console.log('經判斷過後的頁面:', page);

            let sort = req.query.sortDate || 'DESC';
            if (req.query.sortDirection === 'ASC') {
                sort = 'ASC';
            }
            // console.log('目前排序方向:', sort);

            let sortField = 'created_at';
            if (
                ['game_score', 'game_time', 'created_at'].includes(
                    req.query.sortField
                )
            ) {
                sortField = req.query.sortField;
            }
            // console.log('目前ORDER依照:', sortField);

            //放入SQL
            const sqlPoint = `SELECT * 
                            FROM member_game_record 
                            ${where} AND user_id=${sid} 
                            ORDER BY ${sortField} ${sort} 
                            LIMIT ${(page - 1) * perPage} , ${perPage}`;
            // console.log('最後執行索取資料的SQL語法:', sqlPoint);
            [rows] = await db.query(sqlPoint);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無相關紀錄';
            output.data = [];
            return res.json({ success: false, output });
        }

        //將日期轉成YYYY/MM/DD
        const formattedRowsPoint = rows.map((row, i) => ({
            ...row,
            created_at: dayjs(row.created_at).format(dateFormat),
        }));

        output.success = true;
        output.data = formattedRowsPoint;
        output.code = 200;
        res.json({
            success: true,
            sid,
            totalRows,
            page,
            totalPages,
            perPage,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in /record-point/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

//收藏 - 貼文列表
router.get('/collect-post/:sid', authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        // console.log('myjwt record point:', req.my_jwt);
        // console.log('(query string來的參數)req.query:', req.query);
        // req.query: { page: '3', sid: '1', pointSource: '遊戲獲得' }
        // console.log('(動態路由)req.params:', req.params);
        // req.params: { sid: '1' }

        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;
        const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 5; // 默認每頁5個貼文

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
            // console.log('輸入頁面小於1，qp:', qp);
            return res.redirect(redirectUrl); // 執行重定向
        }
        const perPage = 5;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM comm_saved WHERE user_id = ${sid}`;
        // console.log('總筆數的SQL語法是:', total_sql_point);
        const [[{ totalRows }]] = await db.query(total_sql_point);
        // console.log('總筆數是:', totalRows);

        let rows = [];
        let totalPages = 0;

        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            // console.log('目前頁面是:', page);
            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
                console.log('輸入頁面超過總頁數了，qp:', qp);
                console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl); // 執行重定向
            }
            // console.log('總頁數為:', totalPages);
            // console.log('經判斷過後的頁面:', page);

            //放入SQL
            const query = `
                        SELECT
                            save.comm_saved_id AS save_id,
                            posts.post_id, 
                            posts.context AS post_context,
                            posts.created_at,
                            posts.updated_at,
                            posts.user_id AS post_userId,
                            users2.user_id AS author_id,
                            users2.email AS email,
                            users2.username AS username,
                            users2.avatar AS avatar,
                            photos.photo_name,
                            photos.img
                        FROM 
                            comm_saved AS save
                        LEFT JOIN     
                            comm_post AS posts
                        ON 
                            save.post_id = posts.post_id
                        LEFT JOIN 
                            member_user AS users 
                        ON 
                            save.user_id = users.user_id
                        LEFT JOIN 
                            member_user AS users2 
                        ON 
                            posts.user_id = users2.user_id
                        LEFT JOIN 
                            comm_photo AS photos 
                        ON 
                            posts.post_id = photos.post_id
                        WHERE 
                            save.user_id = ${sid}
                        ORDER BY 
                            save.comm_saved_id DESC
                        LIMIT ${(page - 1) * perPage} , ${perPage}`;
            // console.log('要拿收藏貼文的SQL語法:', query);
            [rows] = await db.query(query);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const posts = rows.map((post) => {
            if (post.img) {
                const imageBase64 = Buffer.from(post.img).toString('base64');
                return {
                    ...post,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }
            return post;
        });

        output.success = true;
        output.data = posts;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in /record-point/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});
//收藏 - 刪除貼文
router.delete(
    '/collect-post-delete/:save_id',
    authenticate,
    async (req, res) => {
        const output = {
            success: false,
            error: '',
            code: 0,
            data: [],
        };
        try {
            if (!req.my_jwt?.id) {
                output.success = false;
                output.code = 430;
                output.error = '沒授權';
                return res.json({ output });
            }
            let save_id = req.params.save_id;
            // console.log('確認comm_saved_id為:', save_id);
            // 1.先確認有無此save_id的存在
            const sql1 = 'SELECT * FROM comm_saved WHERE comm_saved_id=? ';
            const [rows1] = await db.query(sql1, [save_id]);
            //沒這個save_id return
            if (!rows1.length) {
                output.code = 401;
                output.error = '沒這篇貼文';
                return res.json({ output });
            }
            const sql2 = ` DELETE FROM comm_saved WHERE comm_saved_id=? `;
            const [result] = await db.query(sql2, [save_id]);
            // console.log('移除後結果:', result);
            //看看有無移除成功
            if (result.affectedRows) {
                output.success = true;
                output.action = 'remove';
                return res.json({ output });
            } else {
                //沒移除成功
                output.code = 410;
                output.error = '無法移除';
                return res.json({ output });
            }
        } catch (error) {
            console.error('Error in deleting post', error);
            output.success = false;
            output.code = 500;
            output.error = '伺服器錯誤';
            res.status(500).json({ success: false, output });
        }
    }
);

//收藏 - 酒吧列表
router.get('/collect-bar/:sid', authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        // console.log('myjwt record point:', req.my_jwt);
        // console.log('(query string來的參數)req.query:', req.query);
        // req.query: { page: '3', sid: '1', pointSource: '遊戲獲得' }
        // console.log('(動態路由)req.params:', req.params);
        // req.params: { sid: '1' }

        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;
        const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 5; // 默認每頁5個貼文

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
            // console.log('輸入頁面小於1，qp:', qp);
            return res.redirect(redirectUrl); // 執行重定向
        }
        const perPage = 5;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM bar_saved WHERE user_id = ${sid}`;
        // console.log('總筆數的SQL語法是:', total_sql_point);
        const [[{ totalRows }]] = await db.query(total_sql_point);
        // console.log('總筆數是:', totalRows);

        let rows = [];
        let totalPages = 0;

        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            // console.log('目前頁面是:', page);
            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
                // console.log('輸入頁面超過總頁數了，qp:', qp);
                // console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl); // 執行重定向
            }
            console.log('總頁數為:', totalPages);
            // console.log('經判斷過後的頁面:', page);

            //放入SQL
            const query = `
                        SELECT
                            save.bar_saved_id AS save_id,
                            users.email,
                            users.username,
                            bars.bar_id, 
                            bars.bar_name,
                            area.bar_area_name AS area,
                            bars.bar_addr AS address,
                            type.bar_type_name AS type,
                            bars.bar_contact AS contact,
                            bars.bar_description AS description,
                            photos.bar_pic_name AS img_name,
                            photos.bar_img AS img
                        FROM 
                        bar_saved AS save
                        LEFT JOIN     
                            bars
                        ON 
                            save.bar_id = bars.bar_id
                        LEFT JOIN 
                            member_user AS users 
                        ON 
                            save.user_id = users.user_id
                        LEFT JOIN 
                            bar_pic AS photos 
                        ON 
                            bars.bar_id = photos.bar_id
                        LEFT JOIN 
                            bar_area AS area 
                        ON 
                            bars.bar_area_id = area.bar_area_id
                        LEFT JOIN 
                            bar_type AS type 
                        ON 
                            bars.bar_type_id = type.bar_type_id
                        WHERE 
                            save.user_id = ${sid}
                        ORDER BY 
                            save.bar_saved_id DESC
                        LIMIT ${(page - 1) * perPage} , ${perPage}`;
            // console.log('要拿酒吧貼文的SQL語法:', query);
            [rows] = await db.query(query);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const bars = rows.map((bar) => {
            if (bar.img) {
                const imageBase64 = Buffer.from(bar.img).toString('base64');
                return {
                    ...bar,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }
            return bar;
        });

        output.success = true;
        output.data = bars;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in /record-point/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});
//收藏 - 刪除酒吧
router.delete(
    '/collect-bar-delete/:save_id',
    authenticate,
    async (req, res) => {
        const output = {
            success: false,
            error: '',
            code: 0,
            data: [],
        };
        try {
            if (!req.my_jwt?.id) {
                output.success = false;
                output.code = 430;
                output.error = '沒授權';
                return res.json({ output });
            }
            let save_id = req.params.save_id;
            // console.log('確認bar_saved_id為:', save_id);
            // 1.先確認有無此save_id的存在
            const sql1 = 'SELECT * FROM bar_saved WHERE bar_saved_id=? ';
            const [rows1] = await db.query(sql1, [save_id]);
            //沒這個save_id return
            if (!rows1.length) {
                output.code = 401;
                output.error = '無收藏此間酒吧';
                return res.json({ output });
            }
            const sql2 = ` DELETE FROM bar_saved WHERE bar_saved_id=? `;
            const [result] = await db.query(sql2, [save_id]);
            // console.log('移除後結果:', result);
            //看看有無移除成功
            if (result.affectedRows) {
                output.success = true;
                output.action = 'remove';
                return res.json({ output });
            } else {
                //沒移除成功
                output.code = 410;
                output.error = '無法移除';
                return res.json({ output });
            }
        } catch (error) {
            console.error('Error in deleting post', error);
            output.success = false;
            output.code = 500;
            output.error = '伺服器錯誤';
            res.status(500).json({ success: false, output });
        }
    }
);

//收藏 - 電影列表
router.get('/collect-movie/:sid', authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        // console.log('myjwt record point:', req.my_jwt);
        // console.log('(query string來的參數)req.query:', req.query);
        // req.query: { page: '3', sid: '1', pointSource: '遊戲獲得' }
        // console.log('(動態路由)req.params:', req.params);
        // req.params: { sid: '1' }

        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;
        const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 5; // 默認每頁5個貼文

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
            // console.log('輸入頁面小於1，qp:', qp);
            return res.redirect(redirectUrl); // 執行重定向
        }
        const perPage = 5;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM booking_movie_saved WHERE user_id = ${sid}`;
        // console.log('總筆數的SQL語法是:', total_sql_point);
        const [[{ totalRows }]] = await db.query(total_sql_point);
        // console.log('總筆數是:', totalRows);

        let rows = [];
        let totalPages = 0;

        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            // console.log('目前頁面是:', page);
            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`; // 構建完整的重定向 URL
                // console.log('輸入頁面超過總頁數了，qp:', qp);
                // console.log('Redirecting to:', redirectUrl);
                return res.redirect(redirectUrl); // 執行重定向
            }
            // console.log('總頁數為:', totalPages);
            // console.log('經判斷過後的頁面:', page);

            //放入SQL
            const query = `
                        SELECT
                            save.booking_movie_saved_id AS save_id,
                            users.email,
                            users.username,
                            movie.title, 
                            movie.movie_id,
                            movie.movie_description AS description,
                            movie.movie_rating AS rating,
                            movie.poster_img AS img_name,
                            movie.movie_img AS img,
                            type.movie_type AS type
                        FROM 
                        booking_movie_saved AS save
                        LEFT JOIN     
                            booking_movie AS movie
                        ON 
                            save.movie_id = movie.movie_id
                        LEFT JOIN 
                            member_user AS users 
                        ON 
                            save.user_id = users.user_id
                        LEFT JOIN 
                            booking_movie_type AS type 
                        ON 
                            movie.movie_type_id = type.movie_type_id
                        WHERE 
                            save.user_id = ${sid}
                        ORDER BY 
                            save.booking_movie_saved_id DESC
                        LIMIT ${(page - 1) * perPage} , ${perPage}`;
            // console.log('要拿電影的SQL語法:', query);
            [rows] = await db.query(query);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const movies = rows.map((movie) => {
            if (movie.img) {
                const imageBase64 = Buffer.from(movie.img).toString('base64');
                return {
                    ...movie,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }
            return movie;
        });

        output.success = true;
        output.data = movies;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in collect-movie/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});
//收藏 - 刪除電影
router.delete(
    '/collect-movie-delete/:save_id',
    authenticate,
    async (req, res) => {
        const output = {
            success: false,
            error: '',
            code: 0,
            data: [],
        };
        try {
            if (!req.my_jwt?.id) {
                output.success = false;
                output.code = 430;
                output.error = '沒授權';
                return res.json({ output });
            }
            let save_id = req.params.save_id;
            // console.log('確認movie_saved_id為:', save_id);
            // 1.先確認有無此save_id的存在
            const sql1 =
                'SELECT * FROM booking_movie_saved WHERE booking_movie_saved_id=? ';
            const [rows1] = await db.query(sql1, [save_id]);
            //沒這個save_id return
            if (!rows1.length) {
                output.code = 401;
                output.error = '無收藏此間酒吧';
                return res.json({ output });
            }
            const sql2 = ` DELETE FROM booking_movie_saved WHERE booking_movie_saved_id=? `;
            const [result] = await db.query(sql2, [save_id]);
            // console.log('移除後結果:', result);
            //看看有無移除成功
            if (result.affectedRows) {
                output.success = true;
                output.action = 'remove';
                return res.json({ output });
            } else {
                //沒移除成功
                output.code = 410;
                output.error = '無法移除';
                return res.json({ output });
            }
        } catch (error) {
            console.error('Error in deleting post', error);
            output.success = false;
            output.code = 500;
            output.error = '伺服器錯誤';
            res.status(500).json({ success: false, output });
        }
    }
);

//Navbar收藏列表
router.get('/collect-list/:sid', authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        // console.log('JWToken來的id:', req.my_jwt);
        // console.log('(動態路由)req.params:', req.params);

        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;

        let rows = [];
        //放入SQL
        const query = `
            (
                SELECT
                    posts.user_id AS author_id,
                    author.email AS author_email,
                    author.avatar AS author_avatar,
                    users.user_id,
                    users.username,
                    users.email,
                    comm_saved.comm_saved_id AS saved_id,
                    comm_saved.post_id AS item_id,
                    comm_saved.created_at AS created_at,
                    pic.img AS img,
                    pic.photo_name AS img_name,
                CASE
                    WHEN author.username IS NOT NULL THEN author.username
                    ELSE 'Unknown'
                END AS title,
                    COALESCE(likes.likes_count, 0) AS subtitle,
                    posts.context AS content,
                    NULL AS rating,
                    'post' AS item_type
                FROM member_user AS users
                LEFT JOIN comm_saved ON users.user_id = comm_saved.user_id
                LEFT JOIN comm_photo AS pic ON pic.post_id = comm_saved.post_id
                LEFT JOIN comm_post AS posts ON posts.post_id = comm_saved.post_id
                LEFT JOIN member_user AS author ON posts.user_id = author.user_id
                LEFT JOIN (
                SELECT post_id, COUNT(*) AS likes_count
                FROM comm_likes
                GROUP BY post_id
            ) AS likes ON posts.post_id = likes.post_id
                WHERE users.user_id = ${sid}
            UNION
                SELECT
                NULL AS author_id,
                NULL AS author_email,
                NULL AS author_avatar,
                    users.user_id,
                    users.username,
                    users.email,
                    bar_saved.bar_saved_id AS saved_id,
                    bar_saved.bar_id AS item_id,
                    bar_saved.created_at AS created_at,
                    pic.bar_img AS img,
                    pic.bar_pic_name AS img_name,
                    bars.bar_name AS title,
                    bars.bar_addr AS subtitle,
                    bars.bar_description AS content,
                    NULL AS rating,
                    'bar' AS item_type
                FROM member_user AS users
                LEFT JOIN bar_saved ON users.user_id = bar_saved.user_id
                LEFT JOIN bar_pic AS pic ON pic.bar_id = bar_saved.bar_id
                LEFT JOIN bars AS bars ON bars.bar_id = bar_saved.bar_id
                WHERE users.user_id = ${sid}
            UNION
                SELECT
                NULL AS author_id,
                NULL AS author_email,
                NULL AS author_avatar,
                    users.user_id,
                    users.username,
                    users.email,
                    movie_saved.booking_movie_saved_id AS saved_id,
                    movie_saved.movie_id AS item_id,
                    movie_saved.created_at AS created_at,
                    movies.movie_img AS img,
                    movies.poster_img AS img_name,
                    movies.title AS title,
                    movies_type.movie_type AS subtitle,
                    movies.movie_description AS content,
                    movies.movie_rating AS rating,
                    'movie' AS item_type
                FROM member_user AS users
                LEFT JOIN booking_movie_saved AS movie_saved ON users.user_id = movie_saved.user_id
                LEFT JOIN booking_movie AS movies ON movies.movie_id = movie_saved.movie_id
                LEFT JOIN booking_movie_type AS movies_type ON movies.movie_type_id = movies_type.movie_type_id
                WHERE users.user_id = ${sid}
            )
            ORDER BY created_at DESC
            LIMIT 0, 10`;
        // console.log('要拿收藏的SQL語法:', query);
        [rows] = await db.query(query);
        // console.log('拿到的資料:', rows);

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const lists = rows.map((list) => {
            if (list.img) {
                const imageBase64 = Buffer.from(list.img).toString('base64');
                return {
                    ...list,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }

            return list;
        });
        //過濾掉沒有save_id的 DATA
        const listsFiltered = lists.filter((list) => list.saved_id !== null);

        // console.log('轉換過後的lists', listsFiltered);

        output.success = true;
        output.data = listsFiltered;
        output.code = 200;

        res.json({
            success: true,
            sid,
            query: req.query,
            output,
        });
    } catch (error) {
        console.error('Error in collect-list:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default router;
