import db from '../../utils/mysql2-connect.js';

export const getNoti = async (userId) => {
    const query = `
        SELECT 
            cn.comm_noti_id As notiId,
            cn.sender_id AS senderId,
            cn.receiver_id,
            cn.type,
            cn.message,
            cn.is_read AS isRead,
            cn.post_id AS postId,
            cn.created_at,
            cn.updated_at,
            u.username AS senderName,
            u.avatar
        FROM 
            comm_noti cn
        INNER JOIN 
            member_user u ON cn.sender_id = u.user_id
        WHERE 
            cn.receiver_id = ?
        ORDER BY 
            cn.created_at DESC
    `;

    const [results] = await db.query(query, [userId]);
    return results;
};
