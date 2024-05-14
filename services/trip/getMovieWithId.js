export const getMovieWithId = async (req, res) => {
    const { trip_plan_id } = req.params; //從路徑中取得 trip_plan_id
    try {
        const [results] = await db.query(
            `
            SELECT 
                bm.*, 
                bmt.movie_type
            FROM 
                \`booking_movie\` bm
            INNER JOIN 
                \`booking_movie_type\` bmt ON bm.movie_type_id = bmt.movie_type_id
            INNER JOIN 
                \`trip_details\` td ON bm.movie_id = td.movie_id
            WHERE
                td.trip_plan_id = ?;
            `,
            [trip_plan_id]
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
