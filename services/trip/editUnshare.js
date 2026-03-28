import prisma from '../../utils/prisma-client.js';

// 取消分享行程
export const editUnshare = async (trip_plan_id) => {
    try {
        return await prisma.trip_plans.update({
            where: {
                trip_plan_id: Number(trip_plan_id),
            },
            data: {
                trip_draft: false, // 0 in original SQL
            },
        });
    } catch (error) {
        console.error('Error unsharing trip plan:', error);
        throw error;
    }
};
