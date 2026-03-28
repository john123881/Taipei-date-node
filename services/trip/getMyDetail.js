import prisma from '../../utils/prisma-client.js';

export const getMyDetail = async (trip_plan_id) => {
    return await prisma.trip_calendar.findMany({
        where: {
            trip_plan_id: Number(trip_plan_id),
        },
    });
};
