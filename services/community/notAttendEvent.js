import db from '../../utils/mysql2-connect.js';

export const notAttendEvent = async (eventId, userId) => {
    const query = `DELETE FROM comm_participants WHERE comm_event_id = ? AND user_id = ?`;
    const [results] = await db.query(query, [eventId, userId]);
    return results;
};
