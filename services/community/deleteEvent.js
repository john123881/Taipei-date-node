import prisma from '../../utils/prisma-client.js';

export const deleteEvent = async (eventId) => {
    const results = await prisma.comm_events.delete({
        where: {
            comm_event_id: Number(eventId),
        },
    });

    return results;
};
