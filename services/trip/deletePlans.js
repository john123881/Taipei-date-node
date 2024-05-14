import db from "../../utils/mysql2-connect.js";

//刪除單筆資料
export const deletePlans = async (tripPlanId) => {
  try {
    const sql = `DELETE FROM trip_plans WHERE trip_plan_id = ?`;
    const [results] = await db.query(sql, [tripPlanId]);

    if (results.affectedRows > 0) {
      return { success: true, message: "資料刪除成功" };
    } else {
      return { success: false, error: "沒有找到trip_plan_id相符的資料" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: "從資料庫刪除資料失敗" };
  }
};
