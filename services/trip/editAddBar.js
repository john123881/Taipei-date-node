import db from '../../utils/mysql2-connect.js';

export const editAddBar = async (req, res) => {
    const { trip_detail_id, bar_id } = req.body;

    try {
        const sql =
            'UPDATE trip_details SET bar_id = ? WHERE trip_detail_id = ?';
        const values = [bar_id, trip_detail_id];
        const [results] = await db.query(sql, values);

        if (results.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: 'No record found with the given ID' });
        }

        return res.json({ message: 'Record updated successfully' }); // 使用 res.json() 返回 JSON 格式的響應
    } catch (error) {
        console.error('Error updating the database:', error);
        if (!res.headersSent) {
            // 檢查是否已經發送了響應
            return res.status(500).json({
                message: 'Failed to update the database',
                error: error.message,
            });
        }
    }
};
