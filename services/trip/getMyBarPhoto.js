import prisma from '../../utils/prisma-client.js';

export const getMyBarPhoto = async (trip_plan_id) => {
    return await prisma.trip_details.findMany({
        where: {
            trip_plan_id: Number(trip_plan_id),
        },
        include: {
            bars: {
                include: {
                    bar_pic: true,
                },
            },
        },
    });
};
