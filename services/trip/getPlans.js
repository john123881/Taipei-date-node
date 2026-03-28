import prisma from '../../utils/prisma-client.js';

export const getPlans = async (user_id) => {
    try {
        return await prisma.trip_plans.findMany({
            where: {
                user_id: Number(user_id),
            },
        });
    } catch (error) {
        console.error('Error fetching trip plans:', error);
        throw new Error('Error fetching data from the database');
    }
};
