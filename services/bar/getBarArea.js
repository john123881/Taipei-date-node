import prisma from '../../utils/prisma-client.js';

// 獲取所有酒吧區域列表
export const getBarArea = async () => {
    return await prisma.bar_area.findMany({
        select: {
            bar_area_id: true,
            bar_area_name: true,
        },
    });
};
