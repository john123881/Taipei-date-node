import 'dotenv/config';
import mysql from 'mysql2/promise';

// const {
//     DB_HOST,
//     DB_USER,
//     DB_PASS,
//     DB_NAME,
//     JAWSDB_HOST,
//     JAWSDB_USER,
//     JAWSDB_PASS,
//     JAWSDB_NAME,
// } = process.env;


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }, 
    waitForConnections: true,
    connectionLimit: 10, // 適度增加連線數
    queueLimit: 0,
    enableKeepAlive: true, // 重要：防止 ECONNRESET
    keepAliveInitialDelay: 10000, // 10秒發送一次心跳
});

export default db;
