import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import db from '../utils/mysql2-connect.js';

const MysqlStore = mysqlSession(session);
const sessionStore = new MysqlStore({}, db);

export const sessionOptions = {
    saveUninitialized: true,
    resave: true,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        secure: true, // Render / Production 必備
        sameSite: 'none', // 跨網域必備
    },
};

export default session(sessionOptions);
