import db from '../../utils/mysql2-connect.js';

export const deletePost = async (postId) => {
    const query = `DELETE FROM comm_post WHERE post_id = ?`;

    const [results] = await db.query(query, [postId]);

    return results;
};
