import db from '../../utils/mysql2-connect.js';

export const getSuggestUsers = async () => {
    const query = `
    SELECT user_id, email, username, avatar
    FROM member_user 
    ORDER BY RAND() 
    LIMIT 5`;

    const [results] = await db.query(query);

    return results;
};
