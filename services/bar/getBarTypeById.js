import prisma from '../../utils/prisma-client.js';

// 獲取所有酒吧種類列表
export const getBarTypeById = async (bar_type_id) => {
    return await prisma.bar_type.findUnique({
        where: {
            bar_type_id: Number(bar_type_id),
        },
    });
};