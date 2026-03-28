import prisma from '../../utils/prisma-client.js';

// 獲取所有酒吧區域列表
export const getBarAreaById = async (bar_area_id) => {
    return await prisma.bar_area.findUnique({
        where: {
            bar_area_id: Number(bar_area_id),
        },
    });
};
