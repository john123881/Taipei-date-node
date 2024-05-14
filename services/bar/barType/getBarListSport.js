import db from '../../../utils/mysql2-connect.js';

// 獲取運動酒吧的酒吧列表
export const getBarListSport = async () => {
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
    WHERE bars.bar_type_id =1
  `;
    const [results] = await db.query(sql);
    return results;
};
