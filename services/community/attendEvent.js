import prisma from '../../utils/prisma-client.js';

export const attendEvent = async (eventId, userId) => {
    const results = await prisma.comm_participants.create({
        data: {
            comm_event_id: Number(eventId),
            user_id: Number(userId),
        },
    });
    return results;
};
