import prisma from '../../utils/prisma-client.js';

export const createPlansAndCalendar = async (
    user_id,
    planData,
    calendarData = {}
) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 創建行程計畫
            const plan = await tx.trip_plans.create({
                data: {
                    ...planData,
                    user_id: Number(user_id),
                    // 確保 trip_draft 是布林值
                    trip_draft: Boolean(planData.trip_draft),
                    // 如果有日期字串，轉換為 Date 對象
                    trip_date: planData.trip_date
                        ? new Date(planData.trip_date)
                        : undefined,
                },
            });

            // 創建關聯的日曆數據
            await tx.trip_calendar.create({
                data: {
                    ...calendarData,
                    trip_plan_id: plan.trip_plan_id,
                },
            });

            return plan;
        });

        return {
            success: true,
            tripPlanId: result.trip_plan_id,
            tripDate: result.trip_date,
            tripTitle: result.trip_title,
            message: '行程計畫和行程日曆成功創建。',
        };
    } catch (error) {
        console.error('Error creating trip plans and calendar:', error);
        return { success: false, error: '新增資料到資料庫時出錯' };
    }
};
