import prisma from '../../utils/prisma-client.js';

export const savedBar = async (barId, userId) => {
    return await prisma.bar_saved.create({
        data: {
            bar_id: Number(barId),
            user_id: Number(userId),
        },
    });
};
