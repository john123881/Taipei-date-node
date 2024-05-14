import db from '../../utils/mysql2-connect.js';

export const getOtherPlans = async (user_id) => {
    try {
        const [results] = await db.query(
            //這邊之後要改成 WHERE `trip_draft` = 1 且 user_id 不等於使用者
            'SELECT * FROM `trip_plans` WHERE `trip_draft` = 1 AND `user_id` != ? ORDER BY `trip_plan_id` DESC', //使用參數
            [user_id] // 參數值
        );
        // res.json(results);
        return results;
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching data from the database');
    }
};
