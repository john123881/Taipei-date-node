import express from 'express';
import { trip } from '../apiConfig.js';
import { getOtherPlans } from '../../services/index.js';
// 中介軟體，存取隱私會員資料用
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

router.get(trip.getOtherPlans, authenticate, async (req, res) => {
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
        const results = await getOtherPlans(user_id); // 將 user_id 傳遞给 getOtherPlans 函數
        res.json(results);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ success: false, error: 'Error fetching plans' });
    }
});

export default router;
