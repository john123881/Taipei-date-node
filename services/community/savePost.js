import db from '../../utils/mysql2-connect.js';

export const savePost = async (postId, userId) => {
    const query = `INSERT INTO comm_saved(post_id, user_id) VALUES (?, ?)`;
    const [results] = await db.query(query, [postId, userId]);
    return results;
};
