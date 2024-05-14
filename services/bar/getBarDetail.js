import db from "../../utils/mysql2-connect.js";

export const getBarDetail = async () => {
  const sql = `
    SELECT 
        bars.*, 
        bar_area.bar_area_name, 
        bar_type.bar_type_name,
        bar_pic.bar_pic_id,
        bar_pic.bar_pic_name
    FROM 
        bars
    LEFT JOIN 
        bar_area ON bars.bar_area_id = bar_area.bar_area_id
    LEFT JOIN 
        bar_type ON bars.bar_type_id = bar_type.bar_type_id
    LEFT JOIN
        bar_pic ON bars.bar_id = bar_pic.bar_id
`;
  const [results] = await db.query(sql);
  return results;
};
