import prisma from '../../utils/prisma-client.js';

export const getMyTripName = async (trip_plan_id) => {
    return await prisma.trip_plans.findFirst({
        where: {
            trip_plan_id: Number(trip_plan_id),
        },
        include: {
            member_user: {
                select: {
                    username: true,
                },
            },
        },
    });
};
