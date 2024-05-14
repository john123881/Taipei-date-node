import db from '../../utils/mysql2-connect.js';

export const checkFollowStatus = async (userId, followingId) => {
    const query = `
  SELECT EXISTS (
      SELECT 1
      FROM comm_follows
      WHERE follower_id = ? AND following_id = ?
  ) AS isFollowing;
  `;
    const [results] = await db.query(query, [userId, followingId]);
    if (results.length > 0) {
        // 回傳第一條紀錄的 isFollowing 狀態
        return {
            followingId: followingId,
            isFollowing: results[0].isFollowing === 1,
        };
    } else {
        return { followingId: followingId, isFollowing: false };
    }
};
