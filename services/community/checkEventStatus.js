import db from '../../utils/mysql2-connect.js';

export const checkEventStatus = async (userId, eventIds) => {
    const placeholders = eventIds.map(() => '?').join(', ');
    const query = `
    SELECT
        e.comm_event_id,
    EXISTS (
        SELECT 1
        FROM comm_participants
        WHERE comm_participants.comm_event_id  = e.comm_event_id  AND user_id = ?
    ) AS isAttended
    FROM
        comm_events AS e
    WHERE
        e.comm_event_id IN (${placeholders});
    `;
    const [results] = await db.query(query, [userId, ...eventIds]);
    // 返回一個布林值表示是否已收藏, 如果已收藏(===1)回傳 true
    return results.map((row) => ({
        eventId: row.comm_event_id,
        isAttended: row.isAttended === 1,
    }));
};
