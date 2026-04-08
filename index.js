// 存取`.env`設定檔案使用
import 'dotenv/config.js';

// 引入 express
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// 引入自定義配置與中介軟體
import { checkEnv } from './utils/check-env.js';
import corsMiddleware from './config/cors-config.js';
import sessionMiddleware from './config/session-config.js';

// 啟動執行環境變數檢查
checkEnv();
import globalLocals from './middlewares/global-locals.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error-handler.js';
import logger from './utils/logger.js';

// 路由
import {
    communityRouter,
    tripRouter,
    barRouter,
    bookingRouter,
    accountRouter,
    authRouter,
} from './routes/index.js';
// 初始化環境變數
dotenv.config();

const app = express();

// 設定模板引擎
app.set('view engine', 'ejs');

// --- Top-level Middlewares ---
app.use((req, res, next) => {
    logger.info(`[DEBUG] Incoming Request: ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);    // CORS 配置
app.use(sessionMiddleware); // Session 配置
app.use(globalLocals);      // 全域 res.locals 設定

// --- 靜態內容 ---
app.use('/', express.static('public'));

// --- 路由掛載 ---

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
app.use('/bar', barRouter);
app.use('/booking', bookingRouter);

// 伺服器啟動
const port = process.env.PORT || 3002;
const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
    const mode = process.env.NODE_ENV || 'production';
    logger.info(`[${mode.toUpperCase()}] Server Started at http://localhost:${port}`);
});

// --- 錯誤處理 (必須放在所有路由之後) ---
app.use(notFoundHandler);    // 404
app.use(globalErrorHandler); // 全域錯誤處理
