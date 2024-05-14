import db from '../../utils/mysql2-connect.js';

export const unfollow = async (userId, FollowingId) => {
    const query = `DELETE FROM comm_follows WHERE follower_id = ? AND following_id = ?`;
    const [results] = await db.query(query, [userId, FollowingId]);
    return results;
};
