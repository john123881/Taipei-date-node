import prisma from '../../utils/prisma-client.js';

export const checkBarStatus = async (userId, barIds) => {
    const uId = Number(userId);
    if (isNaN(uId) || !Array.isArray(barIds)) return [];

    const validBarIds = barIds.map(Number).filter(id => !isNaN(id));
    if (validBarIds.length === 0) return [];

    // 獲取這些酒吧在 bar_saved 中與當前用戶的關聯
    const savedBars = await prisma.bar_saved.findMany({
        where: {
            user_id: uId,
            bar_id: {
                in: validBarIds,
            },
        },
        select: {
            bar_id: true,
        },
    });

    const savedBarIds = new Set(savedBars.map((b) => b.bar_id));

    return barIds.map((id) => ({
        barId: Number(id),
        isSaved: savedBarIds.has(Number(id)),
    }));
};
