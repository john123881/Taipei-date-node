import 'dotenv/config'; // <--- 在第一行加入這句，確保環境變數在連線池建立前就加載
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

// console.log({
//     DB_HOST,
//     DB_USER,
//     DB_PASS,
//     DB_NAME,
//     JAWSDB_HOST,
//     JAWSDB_USER,
//     JAWSDB_PASS,
//     JAWSDB_NAME,
// });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
});

export default db;
