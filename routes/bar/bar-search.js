import express from 'express';
import { bar } from '../apiConfig.js';
import { searchBars } from '../../services/index.js';

const barSearchRouter = express.Router();

barSearchRouter.get(bar.searchBars, async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({
                status: false,
                message: '需要提供 searchTerm',
            });
        }

        const results = await searchBars(searchTerm);
        res.json(results);
    } catch (error) {
        console.error('searchBars error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barSearchRouter;
