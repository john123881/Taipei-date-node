import db from '../../utils/mysql2-connect.js';

export const getFollowings = async (followerId) => {
    const query = `
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.avatar
        FROM
            comm_follows AS f
        JOIN
            member_user AS u ON u.user_id = f.following_id
        WHERE
            f.follower_id = ?;
    `;

    const [results] = await db.query(query, [followerId]);
    return results;
};
