import db from '../../utils/mysql2-connect.js';

export const getBarRatingAverage = async (bar_id) => {
    const sql = `
    SELECT 
        bars.bar_id,
        bars.bar_name,
        AVG(br.bar_rating_star) AS average_rating
    FROM 
        bar_rating br
    LEFT JOIN 
        bars ON br.bar_id = bars.bar_id
    WHERE 
        bars.bar_id = ?
    GROUP BY 
        bars.bar_id;
    `;
    const [results] = await db.query(sql, [bar_id]);
    if (results.length > 0) {
        return {
            barName: results[0].bar_name,
            averageRating: results[0].average_rating,
            userNames: results[0].user_names
                ? results[0].user_names.split(', ')
                : [],
        };
    } else {
        return null;
    }
};
