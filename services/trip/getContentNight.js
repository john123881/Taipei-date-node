import prisma from '../../utils/prisma-client.js';

export const getContentNight = async (trip_plan_id) => {
    return await prisma.trip_details.findMany({
        where: {
            trip_plan_id: Number(trip_plan_id),
            block: 3,
        },
    });
};
