//取得電影的資料
import db from '../../utils/mysql2-connect.js';

export const getMovie = async (req, res) => {
    try {
        const [results] = await db.query(
            `
            SELECT 
            bm.movie_id,
            bm.title,
            bm.poster_img,
            bm.movie_description,
            bm.movie_rating,
            bm.movie_type_id,
            bmt.movie_type
        FROM 
            booking_movie bm
        INNER JOIN 
            booking_movie_type bmt ON bm.movie_type_id = bmt.movie_type_id;
        
        `
        );
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).send('Error fetching data from the database');
    }
};
