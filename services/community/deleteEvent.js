import prisma from '../../utils/prisma-client.js';

export const deleteEvent = async (eventId) => {
    const id = Number(eventId);
    
    // In prisma relationMode, we should delete related records first if cascade isn't working as expected
    // or to ensure total consistency before the main delete
    await prisma.comm_participants.deleteMany({
        where: { comm_event_id: id }
    });

    await prisma.comm_events_photo.deleteMany({
        where: { comm_event_id: id }
    });

    const results = await prisma.comm_events.delete({
        where: {
            comm_event_id: id,
        },
    });

    return results;
};
