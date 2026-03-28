// 存取`.env`設定檔案使用
import 'dotenv/config.js';

// 引入 express
import express from 'express';
import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import db from './utils/mysql2-connect.js';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import { initSocket } from './utils/socket-handler.js';
import { isOriginAllowed } from './utils/cors-config.js';

// 指定要加載的 dotenv 檔案名稱
dotenv.config(); // 預設就會讀取同目錄下的 .env
import { sendError } from './utils/response-handler.js';

// 中介軟體
// 已移至各路由中使用

import {

    communityRouter,
    tripRouter,
    barRouter,
    dateRouter,
    bookingRouter,
    accountRouter,
    authRouter,
} from './routes/index.js';

const MysqlStore = mysqlSession(session);
const sessionStore = new MysqlStore({}, db);

const app = express();

//top-level middleWare
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'https://taipei-date.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002',
];

const corsOption = {
    credentials: true,
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
app.use(cors(corsOption));

app.use((req, res, next) => {
    res.locals.title = 'Taipei Date的網站';
    res.locals.pageName = '';
    res.locals.session = req.session;
    res.locals.originalUrl = req.originalUrl;
    next();
});

app.set('view engine', 'ejs');

app.use(
    session({
        saveUninitialized: true,
        resave: true,
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            secure: true, // Render 是 HTTPS
            sameSite: 'none', // 跨網域必備
        },
    })
);


// 首頁
app.get('/', (req, res) => {
    res.locals.title = '首頁 - ' + res.locals.title;
    res.locals.pageName = 'Taipei Date';
    res.render('home', { name: 'Taipei Date' });
});

// 認證模組 (登入、註冊、OTP、Google登入)
app.use('/', authRouter);

// 各大功能模組
app.use('/account', accountRouter);
app.use('/community', communityRouter);
app.use('/trip', tripRouter);
app.use('/date', dateRouter);
app.use('/bar', barRouter);
app.use('/booking', bookingRouter);

// 靜態內容
app.use('/', express.static('public'));

// server 偵聽
const port = process.env.PORT || 3002;
const server = http.createServer(app);

// 初始化 Socket.IO
initSocket(server);

server.listen(port, '0.0.0.0', () => {
    const mode = process.env.NODE_ENV || 'production';
    console.log(`[${mode.toUpperCase()}] Server Started at http://localhost:${port}`);
});


/* 404 頁面 */
app.use((req, res) => {
    res.status(404).render('404');
});

/**
 * 全域錯誤處理中介軟體 (Global Error Handler)
 * 接收 catchAsync 丟出的錯誤並統一回傳。
 */
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]:', err);
    
    // 如果是 zod 驗證錯誤，可以特別處理 (選填)
    if (err.name === 'ZodError') {
        return sendError(res, '資料格式驗證失敗', 400, err.errors);
    }
    
    sendError(
        res, 
        err.message || '伺服器發生未預期的錯誤', 
        err.statusCode || 500, 
        err
    );
});

