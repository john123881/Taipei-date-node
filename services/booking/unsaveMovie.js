import db from '../../utils/mysql2-connect.js';

export const unsaveMovie = async (movieId, userId) => {
    const query = `DELETE FROM booking_movie_saved WHERE movie_id = ? AND user_id = ?`;
    const [results] = await db.query(query, [movieId, userId]);
    return results;
};
