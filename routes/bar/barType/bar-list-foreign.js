import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListForeign } from '../../../services/index.js';

const barListForeignRouter = express.Router();

// Sports bars
barListForeignRouter.get(bar.getBarListForeign, async (req, res) => {
    try {
        const results = await getBarListForeign();
        res.json(results);
    } catch (error) {
        console.error('getBarListForeign error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barListForeignRouter;
