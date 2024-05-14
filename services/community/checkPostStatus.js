import db from '../../utils/mysql2-connect.js';

export const checkPostStatus = async (userId, postIds) => {
    const placeholders = postIds.map(() => '?').join(', ');
    const query = `
    SELECT
        p.post_id,
    EXISTS (
        SELECT 1
        FROM comm_likes
        WHERE comm_likes.post_id = p.post_id AND user_id = ?
    ) AS isLiked,
    EXISTS (
        SELECT 1
        FROM comm_saved
        WHERE comm_saved.post_id = p.post_id AND user_id = ?
    ) AS isSaved
    FROM
        comm_post AS p
    WHERE
        p.post_id IN (${placeholders});
    `;
    const [results] = await db.query(query, [userId, userId, ...postIds]);
    // 返回一個布林值表示是否已收藏, 如果已收藏(===1)回傳 true
    return results.map((row) => ({
        postId: row.post_id,
        isLiked: row.isLiked === 1,
        isSaved: row.isSaved === 1,
    }));
};
