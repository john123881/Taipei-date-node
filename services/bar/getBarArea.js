import db from '../../utils/mysql2-connect.js';

// 獲取所有酒吧區域列表
export const getBarArea = async () => {
    const sql = `
    SELECT 
      bar_area_id, 
      bar_area_name 
    FROM 
      bar_area;
  `;
    const [results] = await db.query(sql);
    return results;
};
