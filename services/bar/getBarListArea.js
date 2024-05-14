import db from '../../utils/mysql2-connect.js';

// 獲取所有酒吧列表
export const getBarListArea = async (bar_area_id) => {
    console.log('Queried bar_type_id:', bar_area_id); // Debugging output
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
    WHERE bars.bar_area_id =?
`;
    const [results] = await db.query(sql, [bar_area_id]);
    return results;

    // 將 BLOB 數據轉換為 Base64 字符串
    const pics = results.map((pic) => {
        if (pic.bar_img) {
            const imageBase64 = Buffer.from(pic.bar_img).toString('base64');
            return {
                ...pic,
                bar_img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return pic;
    });
    return pics;
};
