import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListSport } from '../../../services/index.js';

const barListSportRouter = express.Router();

// Sports bars
barListSportRouter.get(bar.getBarListSport, async (req, res) => {
    try {
        const results = await getBarListSport();
        res.json(results);
    } catch (error) {
        console.error('getBarListSport error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barListSportRouter;
