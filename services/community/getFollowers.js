import db from '../../utils/mysql2-connect.js';

export const getFollowers = async (followingId) => {
    const query = `
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.avatar
        FROM
            comm_follows AS f
        JOIN
            member_user AS u ON u.user_id = f.follower_id
        WHERE
            f.following_id = ?
    `;

    const [results] = await db.query(query, [followingId]);
    return results;
};
