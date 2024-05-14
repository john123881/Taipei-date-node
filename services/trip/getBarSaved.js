//取得收藏酒吧的資料
import db from '../../utils/mysql2-connect.js';

export const getBarSaved = async (req, res) => {
    try {
        const [results] = await db.query(`SELECT DISTINCT
        bars.bar_id,
        bars.*,
        bar_area.bar_area_name,
        bar_type.bar_type_name,
        bar_pic.bar_pic_name
    FROM 
        bars
    LEFT JOIN 
        bar_area ON bars.bar_area_id = bar_area.bar_area_id
    LEFT JOIN 
        bar_type ON bars.bar_type_id = bar_type.bar_type_id
    LEFT JOIN 
        bar_pic ON bars.bar_id = bar_pic.bar_id;
    
    `);
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).send('No data found');
        }
    } catch (error) {
        console.error('Error fetching data from the database:', error);
        res.status(500).send('Error fetching data from the database');
    }
};
