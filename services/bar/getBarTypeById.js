import db from '../../utils/mysql2-connect.js';

// 獲取所有酒吧種類列表
export const getBarTypeById = async (bar_type_id) => {
    const sql = `
  SELECT
    bar_type_id,
    bar_type_name
  FROM
    bar_type
  WHERE bar_type_id = ?
  `;
    const [results] = await db.query(sql, [bar_type_id]);
    return results[0];
};