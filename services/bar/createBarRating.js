import db from "../../utils/mysql2-connect.js";

//新增單筆資料
export const createBarRating = async (bar_id, bar_rating_star, user_id) => {
    // 將評分數據插入到數據庫中
    const [insertResult] = await db.query(
        `INSERT INTO bar_rating(bar_id, bar_rating_star, user_id) VALUES (?, ?, ?)`,
        [bar_id, bar_rating_star, user_id]
    );

    // 獲取新插入的評分數據的 ID
    const newRatingId = insertResult.insertId;

    // 查詢新插入的評分數據
    const getNewRatingQuery = `
        SELECT 
            bar_rating.*,
            bars.bar_id,
            bars.bar_name,
            member_user.user_id,
            member_user.username
        FROM 
            bar_rating
        LEFT JOIN 
            bars ON bar_rating.bar_id = bars.bar_id
        LEFT JOIN 
            member_user ON bar_rating.user_id = member_user.user_id
        WHERE
            bar_rating.bar_id = ?`;

    const [ratingResults] = await db.query(getNewRatingQuery, [newRatingId]);

    return ratingResults;
};
