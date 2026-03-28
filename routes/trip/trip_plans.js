import express from 'express';
import { trip } from '../apiConfig.js';
import { getPlans, createPlansAndCalendar, deletePlans } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(trip.getPlans, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權', 401);
    }
    const user_id = req.my_jwt.id;
    try {
        const results = await getPlans(user_id);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, 'Error fetching plans', 500, error);
    }
});

// 新增單筆資料
router.post(trip.createPlansAndCalendar, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒有授權', 401);
    }

    try {
        const results = await createPlansAndCalendar(
            req.my_jwt.id,
            req.body.tripPlan,
            req.body.calendarData || {}
        );
        sendSuccess(res, results, '行程與日曆新增成功');
    } catch (error) {
        sendError(res, '行程與日曆新增失敗', 500, error);
    }
});

// 刪除單筆資料
router.delete(trip.deletePlans, async (req, res) => {
    try {
        const tripPlanId = +req.params.trip_plan_id;
        if (!tripPlanId) {
            return sendError(res, '必須提供 trip_plan_id', 400);
        }

        const { success, message, error } = await deletePlans(tripPlanId);

        if (success) {
            sendSuccess(res, null, message);
        } else {
            sendError(res, error || '刪除失敗', 500);
        }
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default router;
