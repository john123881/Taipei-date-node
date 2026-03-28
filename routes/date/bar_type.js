import express from 'express';
import { getBarTypes } from '../../services/index.js';

const router = express.Router();

// 拿取 Bar Type
router.get('/bar_type/api', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const data = await getBarTypes(page);
        res.json(data);
    } catch (error) {
        console.error('getBarTypes error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
