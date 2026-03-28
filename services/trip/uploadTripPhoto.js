import prisma from '../../utils/prisma-client.js';

export const uploadTripPhoto = async (trip_plan_id, trip_pic) => {
    try {
        return await prisma.trip_plans.update({
            where: {
                trip_plan_id: Number(trip_plan_id),
            },
            data: {
                trip_pic,
            },
        });
    } catch (error) {
        console.error('Error updating trip photo:', error);
        throw error;
    }
};
