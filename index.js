// 引入 express
import express from 'express';
import https from 'https';
import fs from 'fs';
import session from 'express-session'; // express-session是一個middleware，需要把它寫在路由之前
import mysqlSession from 'express-mysql-session'; // 可以將登入資訊存入mysql資料庫
import db from './utils/mysql2-connect.js';
import cors from 'cors';
import transporter from './utils/email.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import accountRouter from './routes/account.js';
import {
    createOtpForRegister,
    createOtpForPassword,
} from './utils/otp_service.js';
import dotenv from 'dotenv';
// 指定要加載的 dotenv 檔案名稱
dotenv.config({ path: 'dev.env' });

const { SMTP_TO_EMAIL, SMTP_TO_PASSWORD } = process.env;

// 中介軟體，存取隱私會員資料用
import authenticate from './middlewares/authenticate.js';
// 存取`.env`設定檔案使用
import 'dotenv/config.js';

import {
    communityRouter,
    tripRouter,
    barRouter,
    dateRouter,
    bookingRouter,
} from './routes/index.js';
import { optional } from 'zod';

const MysqlStore = mysqlSession(session);
const sessionStore = new MysqlStore({}, db);

// 建立 web server 物件
const app = express();

// 載入SSL憑證
const options = {
    key: fs.readFileSync('./cert/key.pem'), // 私鑰
    cert: fs.readFileSync('./cert/cert.pem'), // 憑證
};

//top-level middleWare
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//cor設定 (Shinder版)
const corsOption = {
    credentials: true,
    origin: (origin, callback) => {
        callback(null, true);
    },
};
app.use(cors(corsOption));

//cor設定 (Eddy版)
// cors設定，參數為必要，注意不要只寫`app.use(cors())`
// app.use(
//     cors({
//         origin: ['http://localhost:3000', 'https://localhost:9000'],
//         methods: ['GET', 'POST', 'PUT', 'DELETE'],
//         credentials: true,
//     })
// );

// 自訂的頂層的 middlewares
app.use((req, res, next) => {
    res.locals.title = 'Taipei Date的網站';
    res.locals.pageName = '';
    res.locals.session = req.session; // 讓 ejs 可以使用 session
    res.locals.originalUrl = req.originalUrl; // 頁面所在的路徑

    next(); // 這個一定要有
});

// 路由
app.get('/', (req, res) => {
    res.locals.title = '首頁 - ' + res.locals.title;
    res.locals.pageName = 'Taipei Date';

    res.render('home', { name: 'Taipei Date' });
});

//註冊樣版引擎
//"view engine" 是指用於處理和渲染視圖（View）的模板引擎。
app.set('view engine', 'ejs');

app.use(
    session({
        //強制將未初始化的session存回 session store，未初始化的意思是它是新的而且未被修改。
        saveUninitialized: true,
        //強制將session存回 session store, 即使它沒有被修改。預設是 true
        resave: true,
        secret: 'kdjfsk94859348JHGJK85743',
        store: sessionStore,
        //cookie: {
        //  maxAge: 1200_000,
        //}
    })
);

app.use('/account', accountRouter);

//loginCheck
// 檢查登入狀態用
app.get('/login-check/', authenticate, async (req, res) => {
    const sid = req.query?.sid;
    // console.log('when u login-check, JWT-ID:', req.my_jwt?.id);
    // console.log('when u login-check,  sid:', sid);

    // 1.確認收到my_jwt.id
    if (!req.my_jwt?.id) {
        return res.json({ success: false, code: 430, error: '沒授權TOKEN' });
    }
    const jid = req.my_jwt?.id;
    // 2.比對my_jwt.id 有沒有等於 動態路由來的sid
    if (jid.toString() !== sid.toString()) {
        return res.json({ success: false, code: 430, error: 'UserID不匹配' });
    }
    // 3.查詢資料庫目前的資料:確認此id有無存在資料庫
    const sql = `SELECT * FROM member_user WHERE user_id = ? `;
    const [rows] = await db.query(sql, [jid]);

    // console.log('when u login-check,rows:"', rows);
    if (rows.length === 0) {
        return res.json({
            result: false,
            error: '沒有此user_id',
            msg: '沒有此user_id',
        });
    }

    return res.json({ success: true, msg: '確認成功，有Token，UserID也符合' });
});

//JWT測試路由
// app.get('/jwt-data', authenticate, async (req, res) => {
//     // res.send(req.get('Authorization')); //token
//     if (!req.my_jwt) {
//         return res.json({
//             status: 'error',
//             message: '授權失敗，沒有存取令牌',
//         });
//     }
//     res.json(req.my_jwt);
//     // res.send(req.get('Authorization'));
// });

//登入(JWT)
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    const output = {
        success: false,
        error: '',
        code: 0,
        data: {
            id: '',
            email: '',
            password: '',
            username: '',
            token: '',
            getPointLogin: false,
        },
    };

    //若沒有填寫，會顯示"請填寫登入資訊"
    // console.log('Received email:', email);
    // console.log('Received password:', password);
    if (!email || !password) {
        output.error = '請填寫登入資訊';
        output.code = 400;
        return res.json(output);
    }

    //做驗證，頭尾去掉空白
    email = email.trim();
    password = password.trim();

    //對照資料庫，有無此筆email
    const sql = 'SELECT * FROM member_user WHERE email = ? ';
    const [rows] = await db.query(sql, [email]);
    if (!rows.length) {
        //rows沒有長度，代表沒此email，輸出420
        output.error = '無相關帳號';
        output.code = 420;
        return res.json(output);
    }

    //對照資料庫，有此筆email，但為google帳號
    if (rows[0].google_uid !== null) {
        output.error = '此電子郵件已使用Google登入註冊過，請更換Google帳號登入';
        return res.json(output);
    }

    // console.log(rows[0]);
    //驗證輸入密碼與資料庫密碼有無符合，符合為true並於session設置用戶資訊，不符和為false並輸出450
    const result = await bcrypt.compare(password, rows[0].password_hash);
    if (result) {
        output.success = result;
        let row = rows[0];

        const token = jwt.sign(
            {
                id: row.user_id,
                email: row.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '3d',
            }
        );

        output.data = {
            id: row.user_id,
            email: row.email,
            username: row.username,
            token,
            getPointLogin: false,
        };

        //登入獲得積分:
        const sqlGetFromLoginEveryday = `SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = '登入獲得' AND DATE(created_at) = CURDATE() `;
        const [countGetFromLoginEveryday] = await db.query(
            sqlGetFromLoginEveryday,
            [row.user_id]
        );

        if (
            countGetFromLoginEveryday.length > 0 &&
            countGetFromLoginEveryday[0].count > 0
        ) {
            // console.log(
            //     `User ${row.user_id} has already received points for login today.`
            // );
        } else {
            //今天第一次登入，拿到積分
            const sqlSetPointFromLogin = `INSERT INTO member_points_inc (user_id, points_increase, reason, created_at)
            VALUES (?, 10, '登入獲得', NOW());`;
            const [setPoint] = await db.query(sqlSetPointFromLogin, [
                row.user_id,
            ]);
            output.data = {
                id: row.user_id,
                email: row.email,
                username: row.username,
                token,
                getPointLogin: true,
            };
            // console.log(`User ${row.user_id} get points from login!!`);
        }
    } else {
        output.error = '密碼有錯誤';
        output.code = 450;
    }

    res.json(output);
});

//註冊 - 生成TOP
app.post('/register-send-otp', async (req, res) => {
    let { email } = req.body;
    //驗證email格式
    const schemaEmail = z.string().email({ message: '請填寫正確的電郵格式' });
    const resultEmail = schemaEmail.safeParse(email);
    if (!resultEmail.success) {
        return res.json({
            success: false,
            error: '錯誤 - 請填寫正確的電子郵件格式',
        });
    }

    if (email.trim() === '')
        return res.json({ success: false, error: '錯誤 - 缺少必要資料email' });

    //對照資料庫，有無此筆email
    const sql = 'SELECT * FROM member_user WHERE email = ? ';
    const [rows] = await db.query(sql, [email]);
    if (rows.length) {
        return res.json({
            success: false,
            error: '錯誤 - 此Email已註冊過此電子郵件',
        });
    }

    //生成OTP
    const otp = await createOtpForRegister(email);
    //檢查token
    if (!otp.token)
        return res.json({
            success: false,
            error: '錯誤 - 60秒內要求重新產生驗証碼',
        });

    // email內容;
    const mailOptions = {
        from: `"Taipei Date 服務中心"<${process.env.SMTP_TO_EMAIL}>`,
        // to: `${email}`,
        to: `${email}`,
        subject: '註冊要求的電子郵件驗証碼',
        text: `你好， 
        \r\n通知註冊所需要的驗証碼，
        \r\n請輸入以下的6位數字，註冊頁面的"ValidCode"欄位中。

        驗証碼: ${otp.token}

        請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員。
        \r\n\r\n敬上
        \r\nTaipei Date 服務中心`,
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            // 失敗處理
            return res.status(400).json({ success: false, error: '寄信失敗' });
        } else {
            // 成功回覆的json
            return res.json({ success: true, data: null });
        }
    });

    console.log('到這裡應該是有發email成功:', email);
    res.json({ success: true, message: '驗證碼已發送到您的信箱' });
});

//註冊 - 驗證OTP後，資料庫註冊使用者資料
app.post('/register', async (req, res) => {
    let { email, validCode, username, password } = req.body;
    // console.log(req.body,username,email,password)
    const output = {
        success: false,
        bodyData: {
            email: ' ',
            validCode: ' ',
            username: ' ',
            password: ' ',
        },
        error: '', //錯誤消息存在這裡
        code: 0,
    };

    let isPass = true;
    if (!email || !validCode || !username || !password) {
        output.error = '請填寫註冊資訊';
        output.code = 460;
        isPass = false;
        return res.json(output);
    }

    //做驗證，頭尾去掉空白
    email = email.trim();
    validCode = validCode.trim();
    username = username.trim();
    password = password.trim();

    //對照資料庫，有無此筆email
    const sql = 'SELECT * FROM member_user WHERE email = ? ';
    const [rows] = await db.query(sql, [email]);
    if (rows.length) {
        output.error = '已註冊過此電子郵件';
        output.code = 470;
        isPass = false;
        return res.json(output);
    }

    // 1.檢查OTP是否已經存在
    const sqlCheckOTP2 = 'SELECT * FROM otp WHERE email = ? AND token = ?';
    const [rowsOTP2] = await db.query(sqlCheckOTP2, [email, validCode]);
    // console.log('rowsOTP2的內容:', rowsOTP2);
    // console.log('rowsOTP2[0]的內容:', rowsOTP2[0]);
    // console.log('Date.now()的內容:', Date.now());
    // console.log('rowsOTP2[0].exp_timestamp的內容:', rowsOTP2[0].exp_timestamp);
    // console.log(
    //     'Date.now() > rowsOTP2[0].exp_timestamp的結果?:',
    //     Date.now() > rowsOTP2[0].exp_timestamp
    // );
    if (rowsOTP2.length === 0) {
        console.log('ERROR - 電子郵件或是驗證碼資料不存在');
        isPass = false;
        output.success = false;
        output.error = '電子郵件或是驗證碼有誤';
        return res.json(output);
    }
    // 2.存在token - > 計算目前時間比對是否超過，到期的timestamp
    if (Date.now() > rowsOTP2[0].exp_timestamp) {
        console.log('ERROR - 驗證碼已到期');
        isPass = false;
        output.success = false;
        output.error = '驗證碼已到期';
        return res.json(output);
    }

    if (isPass) {
        // req.body.created_at = new Date();
        try {
            //密碼生成HASH
            const password_hash = await bcrypt.hash(password, 12);
            //帶入資料庫
            const sql2 = `INSERT INTO member_user(username, email, password_hash) VALUES (?, ?, ? ) `;
            const [result] = await db.query(sql2, [
                username,
                email,
                password_hash,
            ]);

            const sqlDeleteOTP = `DELETE FROM otp WHERE email = ? `;
            const [result2] = await db.query(sqlDeleteOTP, [email]);
            console.log('註冊成功，刪除OTP: result2:', result2);

            output.success = true;
            output.bodyData.username = req.body.username;
            output.bodyData.email = req.body.email;

            // console.log('final:' ,  output);
            return res.json(output);
        } catch (ex) {
            console.log('錯誤:' + ex);
            output.error = '註冊時發生錯誤';
            output.code = 500;
            output.success = false;
            return res.json(output);
        }
    }
});

//忘記密碼 - 生成TOP
app.post('/forget-password-send-otp', async (req, res) => {
    let { email } = req.body;
    if (email.trim() === '')
        return res.json({ success: false, error: '錯誤 - 請填寫電子郵件' });

    //驗證email格式
    const schemaEmail = z.string().email({ message: '請填寫正確的電郵格式' });
    const resultEmail = schemaEmail.safeParse(email);
    if (!resultEmail.success) {
        return res.json({
            success: false,
            error: '錯誤 - 請填寫正確的電子郵件格式',
        });
    }

    //對照資料庫，有無此筆email
    const sql = 'SELECT * FROM member_user WHERE email = ? ';
    const [rows] = await db.query(sql, [email]);
    // console.log('user_id', rows[0].user_id);
    if (!rows.length) {
        return res.json({
            success: false,
            error: '錯誤 - 使用者電子郵件不存在',
        });
    }
    if (rows[0].google_uid !== null) {
        return res.json({
            success: false,
            error: '綁定google登入之電子郵件不適用',
        });
    }

    //生成OTP
    const otp = await createOtpForPassword(email, rows[0].user_id);
    console.log('生成OTP的內容:', otp);
    //檢查token
    if (!otp.token)
        return res.json({
            success: false,
            error: '錯誤 - 60秒內要求重新產生驗証碼',
        });

    // email內容;
    const mailOptions = {
        from: `"Taipei Date 服務中心"<${process.env.SMTP_TO_EMAIL}>`,
        // to: `${email}`,
        to: `${email}`,
        subject: '重設密碼要求的電子郵件驗証碼',
        text: `你好，
        \r\n通知重設密碼所需要的驗証碼，
        \r\n請輸入以下的6位數字，註冊頁面的"ValidCode"欄位中。

        驗証碼: ${otp.token}

        請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員。
        \r\n\r\n敬上
        \r\nTaipei Date 服務中心`,
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            // 失敗處理
            return res.status(400).json({ success: false, error: '寄信失敗' });
        } else {
            // 成功回覆的json
            return res.json({ success: true, data: null });
        }
    });

    // console.log('到這裡應該是有發email成功:', email);
    res.json({ success: true, data: otp, message: '驗證碼已發送到您的信箱' });
});

//忘記密碼 - 驗證OTP後，資料庫修改使用者密碼
app.put('/forget-password-edit', async (req, res) => {
    let { email, validCode, password, confirmPassword } = req.body;
    // console.log(req.body,username,email,password)
    const output = {
        success: false,
        message: '',
        bodyData: {
            email: ' ',
            validCode: ' ',
            password: ' ',
        },
        error: '', //錯誤消息存在這裡
        code: 0,
    };

    let isPass = true;
    if (!email || !validCode || !password || !confirmPassword) {
        output.error = '缺少必填資料';
        output.code = 460;
        isPass = false;
        return res.json(output);
    }

    //做驗證，頭尾去掉空白
    email = email.trim();
    validCode = validCode.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();

    //對照資料庫，有無此筆email
    const sql1 = 'SELECT * FROM member_user WHERE email = ? ';
    const [rows1] = await db.query(sql1, [email]);
    // console.log('對照資料庫email:', email);
    // console.log('對照資料庫sql1:', sql1);
    // console.log('對照資料庫sql1的結果rows1為:', rows1[0]);

    if (!rows1.length) {
        output.error = '無此電子郵件';
        output.success = false;
        isPass = false;
        return res.json(output);
    }

    // console.log(
    //     '對照資料庫sql1的結果rows1的google_uid為:',
    //     rows1[0].google_uid
    // );
    // console.log('判斷是不是google登入:', rows1[0].google_uid !== null);
    //判斷是否為google登入之email
    if (rows1[0].google_uid !== null) {
        output.error = '綁定google登入之電子郵件不適用';
        output.success = false;
        isPass = false;
        return res.json(output);
    }

    // 1.檢查OTP是否已經存在
    const sqlCheckOTP2 = 'SELECT * FROM otp WHERE email = ? AND token = ?';
    const [rowsOTP2] = await db.query(sqlCheckOTP2, [email, validCode]);

    // console.log('rowsOTP2[0]的內容物:', rowsOTP2[0]);
    // console.log(
    //     'rowsOTP2[0].exp_timestamp的過期時間還有多久:',
    //     (rowsOTP2[0].exp_timestamp - Date.now()) / 60 / 1000 + '分鐘'
    // );
    // console.log(
    //     'rowsOTP2[0].exp_timestamp的過期時間還有多久:',
    //     (rowsOTP2[0].exp_timestamp - Date.now()) / 1000 + '秒'
    // );

    if (!rowsOTP2.length) {
        console.log('ERROR - 此驗證碼資料不存在');
        isPass = false;
        output.success = false;
        output.error = '此驗證碼資料不存在';
        return res.json(output);
    }
    // 2.存在token - > 計算目前時間比對是否超過，到期的timestamp
    if (Date.now() > rowsOTP2[0].exp_timestamp) {
        console.log('ERROR - 驗證碼已到期');
        isPass = false;
        output.success = false;
        output.error = '驗證碼已到期';
        return res.json(output);
    }
    // 3.確認新密碼是否與舊密碼相同:不可與舊密碼相同 rows1[0]
    const checkOldPWD = await bcrypt.compare(password, rows1[0].password_hash);
    // console.log('確認新密碼是否與舊密碼相同:', checkOldPWD);
    if (checkOldPWD) {
        output.success = false;
        output.error = '錯誤 - 新密碼不可與舊密碼相同';
        output.code = 450;
        return res.json(output);
    }

    if (isPass && password === confirmPassword) {
        // req.body.created_at = new Date();

        //密碼生成HASH
        const password_hash = await bcrypt.hash(password, 12);
        //帶入資料庫
        const sql2 = `UPDATE member_user SET password_hash = ? WHERE email=? `;
        // console.log('sql2當sql後的password_hash: ', password_hash);
        // console.log('sql2當sql後的語法: ', sql2);

        try {
            const [result] = await db.query(sql2, [password_hash, email]);
            // console.log('sql2當sql後的[result]: ', result);
            output.success = !!result.changedRows;
            if (result.changedRows) {
                output.message = '密碼更改成功';
            }

            const sqlDeleteOTP = `DELETE FROM otp WHERE email = ? `;
            const [result2] = await db.query(sqlDeleteOTP, [email]);
            console.log('註冊成功，刪除OTP: result2:', result2);

            return res.json(output);
        } catch (ex) {
            console.log('錯誤:' + ex);
            output.error = '註冊時發生錯誤';
            output.code = 500;
            output.success = false;
            return res.json(output);
        }
    }
});

//google-login
app.post('/google-login', async (req, res, next) => {
    // 回傳給前端的資料

    const output = {
        success: false,
        error: '',
        code: 0,
        data: null,
    };

    try {
        const { displayName, email, uid, photoURL } = req.body;
        const google_uid = uid;

        if (!google_uid) {
            return res.status(400).json({ error: '缺少Google登入資料' });
        }

        // // 以下流程:
        // // 1. 先查詢資料庫是否有同google_uid的資料
        // // 2-1. 有存在 -> 執行登入工作
        // // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

        // 1. 先查詢資料庫是否有同google_uid的資料
        const [rows] = await db.query(
            'SELECT * FROM member_user WHERE google_uid = ?',
            [google_uid]
        );

        let userData;

        // // 2-1. 有存在 -> 執行登入工作
        if (rows.length > 0) {
            userData = rows[0];
        } else {
            // 2-2-1. 如果用戶不存在，則創建新用戶
            const insertUserQuery =
                'INSERT INTO member_user(google_uid ,username, email, avatar) VALUES (?, ?, ?, ?)';
            const [insertUserResult] = await db.query(insertUserQuery, [
                google_uid,
                displayName,
                email,
                photoURL,
            ]);

            //2-2-2. 重新從資料庫獲取剛創建的用戶
            const [newUserRows] = await db.query(
                'SELECT * FROM member_user WHERE user_id = ?',
                [insertUserResult.insertId]
            );
            userData = newUserRows[0];
        }

        //3. 檢查今日是否已經登錄過，如果沒有，則添加積分
        const [loginCountRows] = await db.query(
            'SELECT COUNT(*) AS count FROM member_points_inc WHERE user_id = ? AND reason = "登入獲得" AND DATE(created_at) = CURDATE()',
            [userData.user_id]
        );

        if (loginCountRows[0].count === 0) {
            const insertPointsQuery =
                'INSERT INTO member_points_inc (user_id, points_increase, reason, created_at) VALUES (?, 10, "登入獲得", NOW())';
            await db.query(insertPointsQuery, [userData.user_id]);
            userData.getPointLogin = true;
        } else {
            userData.getPointLogin = false;
        }

        //4. 要加到access token中回傳給前端的資料
        //存取令牌(access token)只需要id和username就足夠，其它資料可以再向資料庫查詢
        const token = jwt.sign(
            { id: userData.user_id, email: userData.email },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        output.success = true;
        output.code = 200;
        output.data = {
            id: userData.user_id,
            username: userData.username,
            google_uid: userData.google_uid,
            email: userData.email,
            avatar: userData.avatar,
            token: token,
            getPointLogin: userData.getPointLogin,
        };

        return res.json(output);
    } catch (error) {
        console.error('Google登入時發生錯誤:', error);
        output.error = 'Google登入時發生錯誤';
        output.code = 500;
        return res.status(500).json(output);
    }
});

// For Community Page
app.use(
    '/community',
    communityRouter.eventsRouter,
    communityRouter.postRouter,
    communityRouter.profileRouter,
    communityRouter.createRouter,
    communityRouter.exploreRouter,
    communityRouter.searchRouter,
    communityRouter.postPageRouter
);

// For Trip plans page
app.use(
    '/trip',
    tripRouter.tripPlansRouter,
    tripRouter.myDetailsRouter,
    tripRouter.otherTripRouter,
    tripRouter.contentMorningRouter,
    tripRouter.contentNoonRouter,
    tripRouter.contentNightRouter,
    tripRouter.contentAllDayRouter,
    tripRouter.myBarPhotoRouter,
    tripRouter.myMoviePhotoRouter,
    tripRouter.barNameRouter,
    tripRouter.editShareRouter,
    tripRouter.editUnshareRouter,
    tripRouter.addMorningRouter,
    tripRouter.getBarSavedRouter,
    tripRouter.getMovieRouter,
    tripRouter.editAddBarRouter,
    tripRouter.editAddMovieRouter,
    tripRouter.addNoonRouter,
    tripRouter.addNightRouter,
    tripRouter.deleteDetailRouter,
    tripRouter.getMovieWithIdRouter,
    tripRouter.uploadTripPhotoRouter,
    tripRouter.editDnNRouter,
    tripRouter.addContentBarRouter,
    tripRouter.addOtherContentRouter,
    tripRouter.addContentMovieRouter
);

// For Date page
app.use(
    '/date',
    dateRouter.barTypeRouter,
    dateRouter.bookingMovieTypeRouter,
    dateRouter.friendListRouter,
    dateRouter.friendshipsMessageRouter,
    dateRouter.userInterestRouter
);

// For Bar Branch
app.use(
    '/bar',
    barRouter.barListRouter,
    barRouter.barListTypeRouter,
    barRouter.barListAreaRouter,
    barRouter.barListRadomRouter,
    barRouter.barListAuthRouter,
    barRouter.barListSportRouter,
    barRouter.barListMusicRouter,
    barRouter.barListForeignRouter,
    barRouter.barListSpecialtyRouter,
    barRouter.barListOthersRouter,

    barRouter.barTypeRouter,
    barRouter.barAreaRouter,

    barRouter.barDetailRouter,

    barRouter.barRatingRouter,
    barRouter.barRatingAverageRouter,

    barRouter.barBookingListRouter,
    barRouter.barBookingRouter,

    barRouter.barSavedRouter,
    barRouter.barSearchRouter
);

app.use(
    '/booking',
    bookingRouter.movieListrouter,
    bookingRouter.movieListTypeRouter
);

/* ************** 其他的路, 放在這行之前 *********** */
// 靜態內容的資料夾

app.use('/', express.static('public'));

// 建立HTTPS伺服器
// const server = https.createServer(options, app);

// server.listen(3443, () =>
//     console.log(`Server Started at https://localhost:3443`)
// );

// server 偵聽
// const host = process.env.DB_HOST || process.env.JAWSDB_HOST || '0.0.0.0';
const port = process.env.PORT || 3002;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server Started at http://localhost:${port}`);
});

/* 404 頁面 */
app.use((req, res) => {
    res.status(404).send(`<h2>404 走錯路了</h2>`);
});
