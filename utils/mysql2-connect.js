import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

console.log({ DB_HOST, DB_USER, DB_PASS, DB_NAME });

const db = mysql.createPool({
    host: '119.14.42.80',
    user: 'taipei_date',
    password: '123456',
    database: 'taipei_date',
    // 預設是 3306
    // port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
});

export default db;
