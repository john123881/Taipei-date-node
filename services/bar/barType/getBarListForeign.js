import prisma from '../../../utils/prisma-client.js';

// 獲取特定類型的酒吧列表
export const getBarListForeign = async () => {
    const results = await prisma.bars.findMany({
        where: {
            bar_type_id: 3,
        },
        include: {
            bar_area: true,
            bar_type: true,
        },
    });

    return results.map((bar) => ({
        ...bar,
        bar_area_name: bar.bar_area?.bar_area_name,
        bar_type_name: bar.bar_type?.bar_type_name,
    }));
};
