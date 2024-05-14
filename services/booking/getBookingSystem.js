import db from '../../utils/mysql2-connect.js';

export const getBookingSystem = async () => {
    // const sql = `SELECT * FROM booking_movie`;
    const sql = ` SELECT 
                    bs.*, bm.* 
                  FROM 
                    booking_system bs 
                  JOIN 
                    booking_movie bm 
                  ON 
                    bs.movie_id = bm.movie_id
                  LIMIT 30;
                    `;
    const [results] = await db.query(sql);
    // return results;

    // 將 BLOB 數據轉換為 Base64 字符串
    const pics = results.map((pic) => {
        if (pic.movie_img) {
            const imageBase64 = Buffer.from(pic.movie_img).toString('base64');
            return {
                ...pic,
                movie_img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return pic;
    });
    return pics;
};
