import db from '../../utils/mysql2-connect.js';

export const deleteComment = async (commnetId) => {
    const query = `DELETE FROM comm_comment WHERE comm_comment_id = ?`;

    const [results] = await db.query(query, [commnetId]);

    return results;
};
