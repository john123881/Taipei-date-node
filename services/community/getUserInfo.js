import db from '../../utils/mysql2-connect.js';

export const getUserInfo = async (userId) => {
    const query = `
    SELECT * FROM member_user WHERE user_id = ?
    `;
    const [results] = await db.query(query, [userId]);
    return results;
};
