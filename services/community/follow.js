import db from '../../utils/mysql2-connect.js';

export const follow = async (userId, FollowingId) => {
    const query = `INSERT INTO comm_follows(follower_id, following_id) VALUES (?, ?)`;
    const [results] = await db.query(query, [userId, FollowingId]);
    return results;
};
