import db from '../../utils/mysql2-connect.js';

export const savedBar = async (barId, userId) => {
    const query = `INSERT INTO bar_saved(bar_id, user_id) VALUES (?, ?)`;
    const [results] = await db.query(query, [barId, userId]);
    return results;
};
