import prisma from '../../utils/prisma-client.js';

export const getBarListRandom = async () => {
    // 使用 $queryRaw 來進行 RAND() 查詢，這是 MySQL 中最直接的方式
    const results = await prisma.$queryRaw`
        SELECT 
            b.*, 
            ba.bar_area_name,
            bt.bar_type_name,
            bp.bar_pic_id,
            bp.bar_pic_name,
            bp.bar_img,
            bp.bar_img_url
        FROM 
            bars b
        LEFT JOIN 
            bar_area ba ON b.bar_area_id = ba.bar_area_id
        LEFT JOIN 
            bar_type bt ON b.bar_type_id = bt.bar_type_id
        LEFT JOIN
            bar_pic bp ON b.bar_id = bp.bar_id
        ORDER BY 
            RAND()
        LIMIT 3
    `;

    // 將 BLOB 數據轉換為 Base64 字符串
    const pics = results.map((pic) => {
        let imgSource = null;
        if (pic.bar_img_url) {
            imgSource = pic.bar_img_url;
        } else if (pic.bar_img) {
            imgSource = `data:image/jpeg;base64,${Buffer.from(pic.bar_img).toString('base64')}`;
        }

        return {
            ...pic,
            bar_img: imgSource,
        };
    });
    return pics;
};
