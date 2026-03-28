import prisma from '../../utils/prisma-client.js';

export const isAttendedEvent = async (eventId, userId) => {
    const result = await prisma.comm_participants.findFirst({
        where: {
            comm_event_id: Number(eventId),
            user_id: Number(userId),
        },
    });
    return !!result;
};
