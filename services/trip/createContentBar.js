import db from '../../utils/mysql2-connect.js';

// 新增單筆 bar 資料到 trip_details
export const createContentBar = async (req, res) => {
    const { trip_plan_id } = req.params; // 從 URL 路徑中獲得 trip_plan_id
    const { bar_id, block } = req.body; // 從請求體中提取其他資料

    // 要寫入資料庫的資料
    const planData = {
        trip_plan_id: trip_plan_id,
        block: block,
        bar_id: bar_id,
    };

    try {
        const sql = 'INSERT INTO `trip_details` SET ?';
        const [results] = await db.query(sql, [planData]);
        const newId = results.insertId; // 獲得最新的 trip_detail_id

        console.log('Insertion successful:', results);
        res.status(200).json({
            success: true,
            trip_detail_id: newId,
            message: 'Bar added to trip successfully',
        });
    } catch (error) {
        console.error('Error adding data to the database:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding data to the database',
        });
    }
};
