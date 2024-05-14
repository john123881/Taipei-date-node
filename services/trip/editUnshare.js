import db from '../../utils/mysql2-connect.js';
// 分享行程

export const editUnshare = async (req, res) => {
    const { trip_plan_id } = req.params;

    try {
        const [results] = await db.query(
            'UPDATE `trip_plans` SET trip_draft = 0 WHERE `trip_plan_id`=?',
            [trip_plan_id]
        );
        if (results.affectedRows > 0) {
            res.send('Trip plan successfully updated.');
        } else {
            res.status(404).send('No trip plan found with the given ID');
        }
    } catch (error) {
        console.error('Error updating data in the database:', error);
        res.status(500).send('Error updating data in the database');
    }
};
