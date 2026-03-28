import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListOthers } from '../../../services/index.js';

const barListOthersRouter = express.Router();

// Sports bars
barListOthersRouter.get(bar.getBarListOthers, async (req, res) => {
    try {
        const results = await getBarListOthers();
        res.json(results);
    } catch (error) {
        console.error('getBarListOthers error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barListOthersRouter;
