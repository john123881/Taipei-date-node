import prisma from '../../utils/prisma-client.js';

// 分享行程
export const editShare = async (trip_plan_id) => {
    try {
        return await prisma.trip_plans.update({
            where: {
                trip_plan_id: Number(trip_plan_id),
            },
            data: {
                trip_draft: true, // 1 in original SQL
            },
        });
    } catch (error) {
        console.error('Error sharing trip plan:', error);
        throw error;
    }
};
