import db from '../../utils/mysql2-connect.js';

//新增單筆資料
export const createNoContentNoon = async (req, res) => {
    const { trip_plan_id } = req.params;

    //要寫入資料庫的資料
    const planData = {
        trip_plan_id: trip_plan_id,
        block: 2,
    };

    try {
        const sql = 'INSERT INTO `trip_details` SET ?';
        const [results] = await db.query(sql, [planData]);
        const newId = results.insertId; // 獲得最新的 trip_detail_id

        console.log('Insertion successful:', results);
        res.status(200).json({ success: true, trip_detail_id: newId, results });
    } catch (error) {
        console.error('Error adding data to the database:', error);
        res.status(500).json({
            success: false,
            error: 'Error adding data to the database',
        });
    }
};
