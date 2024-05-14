import db from '../../utils/mysql2-connect.js';

export const createPlansAndCalendar = async (
    user_id,
    planData,
    calendarData
) => {
    console.log(planData, calendarData);
    let connection;
    try {
        // 從通訊埠獲取連接
        connection = await db.getConnection();

        // 開始Transaction
        await connection.beginTransaction();

        // 將 user_id 加入 planData
        const planDataWithUserId = { ...planData, user_id };
        console.log(planDataWithUserId);

        // 插入 trip_plans 資料 ，這邊之後要讓user_id = 登入者id，現在 user_id 預設值為1
        const sqlPlans = 'INSERT INTO `trip_plans` SET ?';
        const [planResults] = await connection.query(sqlPlans, [
            planDataWithUserId,
        ]);
        console.log(planResults);
        const tripPlanId = planResults.insertId; // 獲取新插入記錄的ID
        const tripDate = planResults.insertDate;
        const tripTitle = planResults.insertTitle;

        // 準備並插入 trip_calendar 資料
        const calendarDataWithPlanId = {
            ...calendarData,
            trip_plan_id: tripPlanId,
        };
        const sqlCalendar = 'INSERT INTO `trip_calendar` SET ?';
        await connection.query(sqlCalendar, [calendarDataWithPlanId]);

        // 提交connection
        await connection.commit();

        // 釋放連接回連接池
        connection.release();

        return {
            success: true,
            tripPlanId,
            tripDate,
            tripTitle,
            message: '行程計畫和行程日曆成功創建。',
        };
    } catch (error) {
        // 如果出現錯誤，則 rollback
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.log(error);
        return { success: false, error: '新增資料到資料庫時出錯' };
    }
};
