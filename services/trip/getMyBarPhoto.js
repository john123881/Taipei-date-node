import db from '../../utils/mysql2-connect.js';

export const getMyBarPhoto = async (req, res) => {
    const { trip_plan_id } = req.params;

    try {
        const [results] = await db.query(
            `SELECT
        td.trip_detail_id,
        td.trip_plan_id,
        td.block,
        td.bar_id,
        bp.bar_pic_name,
        bp.bar_img
      FROM
        trip_details AS td
      LEFT JOIN
        bar_pic AS bp ON td.bar_id = bp.bar_id
      WHERE
        td.trip_plan_id = ?`,
            [trip_plan_id]
        );

        if (results.length === 0) {
            res.status(404).json({
                message: 'No picture found for this trip detail.',
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
