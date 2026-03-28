import prisma from '../../utils/prisma-client.js';

// 獲取所有酒吧種類列表
export const getBarType = async () => {
    return await prisma.bar_type.findMany({
        select: {
            bar_type_id: true,
            bar_type_name: true,
        },
    });
};
