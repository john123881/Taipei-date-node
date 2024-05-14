import db from '../../utils/mysql2-connect.js';

export const markNotiAsRead = async (notiId, userId) => {
    const query = `
        UPDATE comm_noti
        SET is_read = 1
        WHERE comm_noti_id = ? AND receiver_id = ?
    `;
    const [results] = await db.query(query, [notiId, userId]);
    return results;
};
