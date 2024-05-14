import db from '../../utils/mysql2-connect.js';

export const getComments = async (postIds) => {
    const placeholders = postIds.map(() => '?').join(', ');

    const qeury = `
    SELECT 
        comment.comm_comment_id,
        comment.context, 
        comment.post_id, 
        comment.user_id,
        users.email,
        users.username,
        users.avatar
    FROM 
        comm_comment AS comment
    LEFT JOIN 
        member_user AS users 
    ON 
        comment.user_id = users.user_id
    WHERE 
        post_id IN (${placeholders});
    `;
    const [results] = await db.query(qeury, [...postIds]);
    return results;
};
