import db from '../../utils/mysql2-connect.js';

export const attendEvent = async (eventId, userId) => {
    const query = `INSERT INTO comm_participants(comm_event_id, user_id) VALUES (?, ?)`;
    const [results] = await db.query(query, [eventId, userId]);
    return results;
};
