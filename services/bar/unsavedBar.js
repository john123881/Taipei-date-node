import db from '../../utils/mysql2-connect.js';

export const unsavedBar = async (barId, userId) => {
    const query = `DELETE FROM bar_saved WHERE bar_id = ? AND user_id = ?`;
    const [results] = await db.query(query, [barId, userId]);
    return results;
};
