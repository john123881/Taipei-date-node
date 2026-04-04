import prisma from '../../utils/prisma-client.js';

export const getOtherPlans = async (user_id, page = 1, limit = 10) => {
    try {
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [total, data] = await Promise.all([
            prisma.trip_plans.count({
                where: {
                    trip_draft: true,
                    user_id: {
                        not: Number(user_id),
                    },
                },
            }),
            prisma.trip_plans.findMany({
                where: {
                    trip_draft: true,
                    user_id: {
                        not: Number(user_id),
                    },
                },
                skip,
                take,
                orderBy: {
                    trip_plan_id: 'desc',
                },
            })
        ]);

        return {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data
        };
    } catch (error) {
        console.error('Error fetching other plans:', error);
        throw new Error('Error fetching data from the database');
    }
};
