import express from 'express';
import { bar } from '../apiConfig.js';
import { searchBars } from '../../services/index.js';

const barSearchRouter = express.Router();

barSearchRouter.get(bar.searchBars, async (req, res) => {
    const { searchTerm } = req.query;

    if (!searchTerm) {
        return res.status(400).json({
            status: false,
            message: '需要提供 searchTerm',
        });
    }

    const results = await searchBars(searchTerm);
    res.json(results);
});

export default barSearchRouter;
