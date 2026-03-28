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
import { initSocket } from './utils/socket-handler.js';

// 指定要加載的 dotenv 檔案名稱
dotenv.config(); // 預設就會讀取同目錄下的 .env

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

const corsOption = {
    credentials: true,
    origin: (origin, callback) => {
        callback(null, true);
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

// 會員模組
app.use(
    '/account',
    accountRouter.gameRecordRouter,
    accountRouter.addDataRouter,
    accountRouter.profileRouter,
    accountRouter.editProfileRouter,
    accountRouter.uploadAvatarRouter,
    accountRouter.changePasswordRouter,
    accountRouter.recordPointRouter,
    accountRouter.recordGameRouter,
    accountRouter.collectPostRouter,
    accountRouter.collectBarRouter,
    accountRouter.collectMovieRouter,
    accountRouter.collectListRouter,
);

// 社群模組
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

// 行程規劃模組
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

// 約會/好友模組
app.use(
    '/date',
    dateRouter.barTypeRouter,
    dateRouter.bookingMovieTypeRouter,
    dateRouter.friendListRouter,
    dateRouter.friendshipsMessageRouter,
    dateRouter.userInterestRouter
);

// 酒吧模組
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

// 訂票模組
app.use(
    '/booking',
    bookingRouter.movieListrouter,
    bookingRouter.movieListTypeRouter
);

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

