import prisma from '../../utils/prisma-client.js';

export const getOtherPlans = async (user_id, page = 1, limit = 10, keyword = '') => {
    try {
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const whereCondition = {
            trip_draft: true,
            // 移除本人排他性，方便測試與完整展示
            /*
            user_id: {
                not: Number(user_id),
            },
            */
            ...(keyword ? {
                trip_title: {
                    contains: keyword,
                }
            } : {})
        };

        const [total, data] = await Promise.all([
            prisma.trip_plans.count({
                where: whereCondition,
            }),
            prisma.trip_plans.findMany({
                where: whereCondition,
                include: {
                    trip_details: true,
                    member_user: {
                        select: {
                            username: true,
                            avatar: true,
                        },
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
