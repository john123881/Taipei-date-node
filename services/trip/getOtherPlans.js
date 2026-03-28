import prisma from '../../utils/prisma-client.js';

export const getOtherPlans = async (user_id) => {
    try {
        return await prisma.trip_plans.findMany({
            where: {
                trip_draft: true, // 假設 1 為 true
                user_id: {
                    not: Number(user_id),
                },
            },
            orderBy: {
                trip_plan_id: 'desc',
            },
        });
    } catch (error) {
        console.error('Error fetching other plans:', error);
        throw new Error('Error fetching data from the database');
    }
};
