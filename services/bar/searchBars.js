import db from '../../utils/mysql2-connect.js';

export const searchBars = async (searchTerm) => {
    const query = `
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
    WHERE 
        bar_name LIKE CONCAT(?, "%") 
    OR 
        bar_area.bar_area_name LIKE CONCAT(?, "%")
    OR 
        bar_type.bar_type_name LIKE CONCAT(?, "%")
    `;

    const [results] = await db.query(query, [
        searchTerm,
        searchTerm,
        searchTerm,
    ]);

    // 將 BLOB 數據轉換為 Base64 字符串
    const bars = results.map((bar) => {
        if (bar.img) {
            const imageBase64 = Buffer.from(bar.img).toString('base64');
            return {
                ...bar,
                img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return bar;
    });
    return bars;
};
