import db from '../../utils/mysql2-connect.js';

export const getMovieListType = async (movie_type_id) => {
    const sql = `SELECT
    booking_movie.movie_id, booking_movie.title, booking_movie.poster_img, booking_movie.movie_description, booking_movie.movie_rating, booking_movie.movie_type_id,
    booking_movie_type.movie_type_id
    FROM booking_movie
    LEFT JOIN  booking_movie_type ON booking_movie.movie_type_id = booking_movie_type.movie_type_id
    WHERE booking_movie.movie_type_id =? `;
    const [results] = await db.query(sql, [movie_type_id]);

    // 將 BLOB 數據轉換為 Base64 字符串
    const pics = results.map((pic) => {
        if (pic.movie_img) {
            const imageBase64 = Buffer.from(pic.movie_img).toString('base64');
            return {
                ...pic,
                movie_img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return pic;
    });
    return pics;
};
