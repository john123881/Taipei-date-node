import db from '../../utils/mysql2-connect.js';

export const getFollows = async (followingId, followerId) => {
    const query = `
    SELECT 
        'followers' AS relation_type,
        COUNT(*) AS count
    FROM 
        comm_follows
    WHERE 
        following_id = ?

    UNION ALL

    SELECT 
        'following' AS relation_type,
        COUNT(*) AS count
    FROM 
        comm_follows
    WHERE 
        follower_id = ?
    `;

    const [results] = await db.query(query, [followingId, followerId]);
    return results;
};
