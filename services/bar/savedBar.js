import prisma from '../../utils/prisma-client.js';

export const savedBar = async (barId, userId) => {
    // 檢查是否已經收藏
    const existing = await prisma.bar_saved.findFirst({
        where: {
            bar_id: Number(barId),
            user_id: Number(userId),
        },
    });

    if (existing) {
        return existing;
    }

    return await prisma.bar_saved.create({
        data: {
            bar_id: Number(barId),
            user_id: Number(userId),
        },
    });
};
