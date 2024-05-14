import express from 'express';
import db from '../../utils/mysql2-connect.js';

const router = express.Router();

// 這個 router 的 top level middleware
router.use((req, res, next) => {
    next();
});

// 拿取 Movie Type
const getMovieTypeListData = async (req) => {
    const page = +req.query.page || 1;
    const perPage = 25;
    // 拿到總記錄數
    let total_sql = `
    SELECT COUNT(*) AS totalRows
    FROM booking_movie_type
  `;
    // 對資料庫查詢結果進行解構，
    const [[{ totalRows }]] = await db.query(total_sql);

    // 計算總頁數
    const totalPages = Math.ceil(totalRows / perPage);

    let sql = `
    SELECT
    movie_type_id,
    movie_type
    FROM
    booking_movie_type
    ORDER BY movie_type_id
    LIMIT ${(page - 1) * perPage}, ${perPage}
  `;

    // 解構賦值，等待直到資料庫結束查詢並返回結果
    const [rows] = await db.query(sql);

    // 處理查詢結果
    const data = rows.map((row) => {
        return {
            movie_type_id: row.movie_type_id,
            movie_type: row.movie_type,
        };
    });

    // 返回處理後的數據
    return {
        success: true,
        totalRows,
        totalPages,
        page,
        perPage,
        data,
    };
};

// 讀取資料，json格式
// http://localhost:3001/date/booking_movie_type/api
router.get('/booking_movie_type/api', async (req, res) => {
    const data = await getMovieTypeListData(req);
    console.log(data);
    res.json(data);
});

export default router;
