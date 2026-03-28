import prisma from '../../utils/prisma-client.js';

export const getBarList = async () => {
    const results = await prisma.bars.findMany({
        include: {
            bar_area: true,
            bar_type: true,
            bar_pic: {
                select: {
                    bar_pic_id: true,
                    bar_pic_name: true,
                },
            },
        },
    });

    // 格式化返回數據以符合原有的扁平結構（如果需要）
    return results.map((bar) => ({
        ...bar,
        bar_area_name: bar.bar_area?.bar_area_name,
        bar_type_name: bar.bar_type?.bar_type_name,
        // 如果原本 SQL 返回的是多行（因為 LEFT JOIN bar_pic），
        // Prisma 會返回嵌套數組。這裡我們模擬原有的扁平邏輯（取第一張圖或保持數組）
        // 觀察原有的 SQL：bars.*, bar_pic.bar_pic_id, bar_pic.bar_pic_name
        // 如果一個 bar 有多張圖，原 SQL 會返回多條紀錄。
        // 為了保持前端兼容性，這裡我們先保持原樣或取第一張。
        bar_pic_id: bar.bar_pic[0]?.bar_pic_id,
        bar_pic_name: bar.bar_pic[0]?.bar_pic_name,
    }));
};
