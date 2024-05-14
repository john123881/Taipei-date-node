import db from '../../utils/mysql2-connect.js';

export const checkMovieStatus = async (userId, movieIds) => {
    const placeholders = movieIds.map(() => '?').join(', ');
    const query = `
    SELECT
        m.movie_id,
    EXISTS (
        SELECT 1
        FROM booking_movie_saved
        WHERE movie_id = m.movie_id AND user_id = ?
    ) AS isSaved
    FROM
        booking_movie AS m
    WHERE
        m.movie_id IN (${placeholders});
    `;
    const [results] = await db.query(query, [userId, ...movieIds]);
    // 返回一個布林值表示是否已收藏, 如果已收藏(===1)回傳 true
    return results.map((row) => ({
        movieId: row.movie_id,
        isSaved: row.isSaved === 1,
    }));
};
