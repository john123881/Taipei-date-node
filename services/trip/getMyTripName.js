//取得單筆資料，分享行程也是用這支
import db from '../../utils/mysql2-connect.js';

export const getMyTripName = async (req, res) => {
    const { trip_plan_id } = req.params;

    try {
        const [results] = await db.query(
            `
  SELECT tp.*, mu.username
  FROM trip_plans AS tp
  JOIN member_user AS mu ON tp.user_id = mu.user_id
  WHERE tp.trip_plan_id = ?
`,
            [trip_plan_id]
        );
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).send('Error fetching data from the database');
    }
};
