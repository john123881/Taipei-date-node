import db from '../../utils/mysql2-connect.js';

export const getBarRatingById = async (bar_id) => {
    const sql = `
    SELECT 
        bar_rating.*,
        bars.bar_name,
        bars.bar_id,
        member_user.user_id,
        member_user.username,
        member_user.avatar
    FROM 
        bar_rating
    LEFT JOIN 
        bars ON bar_rating.bar_id = bars.bar_id
    LEFT JOIN 
        member_user ON bar_rating.user_id = member_user.user_id
    WHERE 
        bar_rating.bar_id = ?;
  `;
    const [results] = await db.query(sql, [bar_id]);
    return results;
};