import db from '../../utils/mysql2-connect.js';

export const getCountPosts = async (userId) => {
    const query = `
    SELECT COUNT(*) AS PostCount 
    FROM comm_post 
    WHERE user_id = ?
    `;
    const [results] = await db.query(query, [userId]);
    return results;
};
