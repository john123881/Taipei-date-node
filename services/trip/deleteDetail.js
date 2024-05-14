import db from '../../utils/mysql2-connect.js';

//刪除單筆資料
export const deleteDetail = async (req, res) => {
    const { trip_detail_id } = req.params; // 改為從 URL 取得參數

    try {
        const sql = `DELETE FROM trip_details WHERE trip_detail_id = ?`;
        const [results] = await db.query(sql, [trip_detail_id]);

        if (results.affectedRows > 0) {
            res.status(200).json({ success: true, message: '資料刪除成功' });
        } else {
            res.status(404).json({
                success: false,
                message: '沒有找到 trip_detail_id 相符的資料',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '從資料庫刪除資料失敗',
            error: error.message,
        });
    }
};
