import prisma from '../../utils/prisma-client.js';

//刪除單筆資料
export const deletePlans = async (tripPlanId) => {
    try {
        const deleteResult = await prisma.trip_plans.delete({
            where: {
                trip_plan_id: Number(tripPlanId),
            },
        });

        if (deleteResult) {
            return { success: true, message: '資料刪除成功' };
        } else {
            return { success: false, error: '沒有找到trip_plan_id相符的資料' };
        }
    } catch (error) {
        console.error('Error deleting trip plan:', error);
        // 如果是 P2025 (找不到紀錄)，返回更具體的消息
        if (error.code === 'P2025') {
            return { success: false, error: '沒有找到trip_plan_id相符的資料' };
        }
        return { success: false, error: '從資料庫刪除資料失敗' };
    }
};
