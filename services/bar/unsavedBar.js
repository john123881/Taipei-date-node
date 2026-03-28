import prisma from '../../utils/prisma-client.js';

export const unsavedBar = async (barId, userId) => {
    return await prisma.bar_saved.deleteMany({
        where: {
            bar_id: Number(barId),
            user_id: Number(userId),
        },
    });
};
