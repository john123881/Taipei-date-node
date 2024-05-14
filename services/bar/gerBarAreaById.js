import db from '../../utils/mysql2-connect.js';

// 獲取所有酒吧區域列表
export const getBarAreaById = async (bar_area_id) => {
    const sql = `
    SELECT 
      bar_area_id, 
      bar_area_name 
    FROM 
      bar_area
    WHERE bar_area_id =?
  `;
    const [results] = await db.query(sql, [bar_area_id]);
    return results[0];
};
