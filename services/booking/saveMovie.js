import db from '../../utils/mysql2-connect.js';

export const saveMovie = async (movieId, userId) => {
    const query = `INSERT INTO booking_movie_saved(movie_id, user_id) VALUES (?, ?)`;
    const [results] = await db.query(query, [movieId, userId]);
    return results;
};
