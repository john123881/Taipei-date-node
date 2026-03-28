import prisma from '../../utils/prisma-client.js';

export const getBarNameForPhoto = async (trip_plan_id) => {
    return await prisma.trip_details.findMany({
        where: {
            trip_plan_id: Number(trip_plan_id),
        },
        include: {
            bars: {
                select: {
                    bar_name: true,
                    bar_city: true,
                    bar_description: true,
                },
            },
        },
    });
};
