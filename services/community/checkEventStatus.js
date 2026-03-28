import prisma from '../../utils/prisma-client.js';

export const checkEventStatus = async (userId, eventIds) => {
    const uId = Number(userId);
    const eIds = eventIds.map(id => Number(id));

    const attended = await prisma.comm_participants.findMany({
        where: {
            user_id: uId,
            comm_event_id: { in: eIds },
        },
        select: { comm_event_id: true },
    });

    const attendedSet = new Set(attended.map(a => a.comm_event_id));

    return eIds.map(eventId => ({
        eventId,
        isAttended: attendedSet.has(eventId),
    }));
};
