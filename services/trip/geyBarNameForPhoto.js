import db from '../../utils/mysql2-connect.js';

export const getBarNameForPhoto = async (req, res) => {
    const { trip_plan_id } = req.params;

    try {
        const [results] = await db.query(
            `SELECT td.trip_detail_id, td.trip_plan_id, td.block, b.bar_name, b.bar_city,b.bar_description
      FROM trip_details td
      JOIN bars b ON td.bar_id = b.bar_id
      WHERE td.trip_plan_id = ?`,
            [trip_plan_id]
        );

        if (results.length === 0) {
            res.status(404).json({
                message: 'No name found for this bar detail.',
            });
        } else {
            res.status(200).json(results);
        }
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).json({
            error: 'Error fetching data from the database',
        });
    }
};
