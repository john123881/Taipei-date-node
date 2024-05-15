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
    // 預設是 3306
    // port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
});

export default db;
