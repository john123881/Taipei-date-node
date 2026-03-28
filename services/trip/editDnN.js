import prisma from '../../utils/prisma-client.js';

export const editDnN = async (trip_plan_id, trip_description, trip_notes) => {
    try {
        return await prisma.trip_plans.update({
            where: {
                trip_plan_id: Number(trip_plan_id),
            },
            data: {
                trip_description,
                trip_notes,
            },
        });
    } catch (error) {
        console.error('Error updating Trip description/notes:', error);
        throw error;
    }
};
