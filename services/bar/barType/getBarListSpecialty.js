import db from '../../../utils/mysql2-connect.js';

// 獲取特定類型的酒吧列表
export const getBarListSpecialty = async () => {
    const sql = `
    SELECT 
        bars.*, 
        bar_area.bar_area_name, 
        bar_type.bar_type_name
    FROM 
        bars
    LEFT JOIN 
        bar_area ON bars.bar_area_id = bar_area.bar_area_id
    LEFT JOIN 
        bar_type ON bars.bar_type_id = bar_type.bar_type_id
    WHERE bars.bar_type_id =4
  `;
    // 使用參數化查詢來安全地插入 bar_type_id
    const [results] = await db.query(sql);
    return results;
};
