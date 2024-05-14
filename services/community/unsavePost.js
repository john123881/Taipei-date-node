import db from '../../utils/mysql2-connect.js';

export const unsavePost = async (postId, userId) => {
    const query = `DELETE FROM comm_saved WHERE post_id = ? AND user_id = ?`;
    const [results] = await db.query(query, [postId, userId]);
    return results;
};
