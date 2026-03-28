import prisma from '../../utils/prisma-client.js';

// 將他人的行程加入自己的日曆
export const createOtherContent = async (tripPlan, tripDetails) => {
    const {
        user_id,
        trip_title,
        trip_content,
        trip_description,
        trip_notes,
        trip_date,
        trip_draft,
        trip_pic,
    } = tripPlan;

    // 確保所有必需欄位都存在
    if (!user_id || !trip_title || !trip_date) {
        throw new Error('缺少必需欄位');
    }

    try {
        return await prisma.$transaction(async (tx) => {
            // 插入 trip_plan
            const plan = await tx.trip_plans.create({
                data: {
                    user_id: Number(user_id),
                    trip_title,
                    trip_content,
                    trip_description,
                    trip_notes,
                    trip_date: new Date(trip_date),
                    trip_draft: Boolean(trip_draft),
                    created_at: new Date(),
                    trip_pic,
                },
            });

            // 為每個 trip_detail 插入數據
            if (tripDetails && tripDetails.length > 0) {
                await tx.trip_details.createMany({
                    data: tripDetails.map((detail) => ({
                        trip_plan_id: plan.trip_plan_id,
                        block: detail.block ? Number(detail.block) : null,
                        movie_id: detail.movie_id ? Number(detail.movie_id) : null,
                        bar_id: detail.bar_id ? Number(detail.bar_id) : null,
                    })),
                });
            }

            return plan;
        });
    } catch (error) {
        console.error('Error in createOtherContent transaction:', error);
        throw error;
    }
};
