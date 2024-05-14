import db from '../../utils/mysql2-connect.js';

export const getPlans = async (user_id) => {
    // 接受 user_id 參數
    try {
        const [results] = await db.query(
            'SELECT * FROM `trip_plans` WHERE `user_id` = ?', // 使用參數
            [user_id] // 參數值
        );
        return results;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching data from the database');
    }
};
