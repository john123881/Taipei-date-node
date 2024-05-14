import db from '../../utils/mysql2-connect.js';

// 獲取所有酒吧種類列表

export const getBarType = async () => {
    const sql = `
  SELECT
    bar_type_id,
    bar_type_name
  FROM
    bar_type
  `;
    const [results] = await db.query(sql);
    return results;
};
