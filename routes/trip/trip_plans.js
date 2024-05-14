import express from 'express';
import { trip } from '../apiConfig.js';
import { getPlans } from '../../services/index.js';
import { createPlansAndCalendar } from '../../services/index.js';
import { deletePlans } from '../../services/index.js';
// 中介軟體，存取隱私會員資料用
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();
const app = express();
app.use(express.json());

router.use((req, res, next) => {
    next();
});

router.get(trip.getPlans, authenticate, async (req, res) => {
    const output = {
        success: false,
        action: '', // add, remove
        error: '',
        code: 0,
    };
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒授權';
        return res.json(output);
    }
    const user_id = req.my_jwt.id; // 獲取 user_id
    try {
        const results = await getPlans(user_id); // 將 user_id 傳遞给 getPlans 函數
        res.json(results);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ success: false, error: 'Error fetching plans' });
    }
});

//新增單筆資料，新增trip_plans時trip_calendar也會同時新增，他們的trip_rlan_id會對應到
router.post(trip.createPlansAndCalendar, authenticate, async (req, res) => {
    const bodyData = req.body; // 定義 bodyData 變數
    const output = {
        success: false,
        bodyData: req.body,
        action: '', // add, remove
        error: '',
        code: 0,
    };
    console.log('bodyData:', bodyData);
    if (!req.my_jwt?.id) {
        output.success = false;
        output.code = 430;
        output.error = '沒有授權';
        return res.json(output);
    }
    const results = await createPlansAndCalendar(
        req.my_jwt.id, // 傳遞 user_id
        req.body
    );
    console.log(req.body);
    res.json(results);
});

//刪除單筆資料
router.delete(trip.deletePlans, async (req, res) => {
    const tripPlanId = +req.params.trip_plan_id;

    // 呼叫刪除函示
    const { success, message, error } = await deletePlans(tripPlanId);

    if (success) {
        res.json({ success: true, message });
    } else {
        res.status(500).json({ success: false, error });
    }
});

export default router;
