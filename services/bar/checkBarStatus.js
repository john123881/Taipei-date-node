import db from '../../utils/mysql2-connect.js';

export const checkBarStatus = async (userId, barIds) => {
    const placeholders = barIds.map(() => '?').join(', ');
    const query = `
    SELECT
        bars.bar_id,
    EXISTS (
        SELECT 1
        FROM bar_saved
        WHERE bar_saved.bar_id = bars.bar_id AND user_id = ?
    ) AS isSaved
    FROM
        bars
    WHERE
        bars.bar_id IN (${placeholders});
    `;
    const [results] = await db.query(query, [userId, userId, ...barIds]);
    // 返回一個布林值表示是否已收藏, 如果已收藏(===1)回傳 true
    return results.map((row) => ({
        barId: row.bar_id,
        isSaved: row.isSaved === 1,
    }));
};
