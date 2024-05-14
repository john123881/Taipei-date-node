import db from '../../utils/mysql2-connect.js';

export const isAttendedEvent = async (eventId, userId) => {
    const query = `SELECT EXISTS (SELECT 1 FROM comm_participants WHERE comm_event_id = ? AND user_id = ?) AS isAttended`;
    const [results] = await db.query(query, [eventId, userId]);
    // 返回一個布林值表示是否已收藏, 如果已收藏(===1)回傳 true
    return results[0].isAttended === 1;
};
