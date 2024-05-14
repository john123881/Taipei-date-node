import db from '../../utils/mysql2-connect.js';

export const addComment = async (context, status, postId, userId) => {
    const [results] = await db.query(
        `INSERT INTO comm_comment(context, status, post_id, user_id) VALUES (?, ?, ?, ?)`,
        [context, status, postId, userId]
    );
    return results;
};
