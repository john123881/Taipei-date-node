import db from '../../utils/mysql2-connect.js';

export const deleteEvent = async (eventId) => {
    const query = `DELETE FROM comm_events WHERE comm_event_id = ?`;

    const [results] = await db.query(query, [eventId]);

    return results;
};
