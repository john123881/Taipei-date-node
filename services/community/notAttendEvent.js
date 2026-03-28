import prisma from '../../utils/prisma-client.js';

export const notAttendEvent = async (eventId, userId) => {
    const results = await prisma.comm_participants.deleteMany({
        where: {
            comm_event_id: Number(eventId),
            user_id: Number(userId),
        },
    });
    return results;
};
