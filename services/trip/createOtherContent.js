import db from '../../utils/mysql2-connect.js';

// 將他人的行程加入自己的日曆
export const createOtherContent = async (req, res) => {
    const connection = await db.getConnection();

    try {
        // 開始資料庫事務
        await connection.beginTransaction();

        const {
            user_id,
            trip_title,
            trip_content,
            trip_description,
            trip_notes,
            trip_date,
            trip_draft,
            trip_pic,
        } = req.body.tripPlan;

        // 確保所有必需欄位都存在
        if (!user_id || !trip_title || !trip_date) {
            throw new Error('缺少必需欄位');
        }

        const tripDetails = req.body.tripDetails;

        // 插入 trip_plan
        const [tripPlanResult] = await connection.execute(
            `INSERT INTO trip_plans (user_id, trip_title, trip_content, trip_description, trip_notes, trip_date, trip_draft, created_at, trip_pic) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
                user_id,
                trip_title,
                trip_content,
                trip_description,
                trip_notes,
                trip_date,
                trip_draft,
                trip_pic,
            ]
        );

        const tripPlanId = tripPlanResult.insertId; // 獲取新增的 trip_plan 的 ID

        // 為每個 trip_detail 插入數據
        for (const detail of tripDetails) {
            await connection.execute(
                `INSERT INTO trip_details (trip_plan_id, block, movie_id, bar_id) VALUES (?, ?, ?, ?)`,
                [
                    tripPlanId,
                    detail.block || null,
                    detail.movie_id || null,
                    detail.bar_id || null,
                ]
            );
        }

        // 提交事務
        await connection.commit();
        res.send({ success: true, tripPlanId });
    } catch (error) {
        // 事務回滾
        await connection.rollback();
        console.error('Transaction error:', error);
        res.status(500).send({
            error: 'Transaction failed',
            details: error.message,
        });
    } finally {
        // 釋放資料庫連接
        connection.release();
    }
};
