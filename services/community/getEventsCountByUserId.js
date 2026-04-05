import prisma from '../../utils/prisma-client.js';

export const getEventsCountByUserId = async (userId) => {
    const count = await prisma.comm_events.count({
        where: {
            user_id: Number(userId),
        },
    });
    return [{ EventCount: count }];
};
