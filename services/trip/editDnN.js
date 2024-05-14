import db from '../../utils/mysql2-connect.js';
// 分享行程

export const editDnN = async (req, res) => {
    const { trip_plan_id } = req.params;
    const { trip_description, trip_notes } = req.body;

    try {
        const [results] = await db.query(
            'UPDATE `trip_plans` SET trip_description = ?, trip_notes = ? WHERE `trip_plan_id` = ?',
            [trip_description, trip_notes, trip_plan_id]
        );
        if (results.affectedRows > 0) {
            res.json('Trip plan successfully updated.');
        } else {
            res.status(404).send('No trip plan found with the given ID');
        }
    } catch (error) {
        console.error('Error updating data in the database:', error);
        res.status(500).send('Error updating data in the database');
    }
};
