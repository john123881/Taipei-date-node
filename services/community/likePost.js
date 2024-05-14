import db from '../../utils/mysql2-connect.js';

export const likePost = async (postId, userId) => {
    const query = `INSERT INTO comm_likes(post_id, user_id) VALUES (?, ?)`;
    const [results] = await db.query(query, [postId, userId]);
    return results;
};
