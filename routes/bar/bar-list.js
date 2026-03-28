import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarList, getBarListId, getFilteredBarList } from '../../services/index.js';

const barListRouter = express.Router();

barListRouter.get(bar.getBarList, async (_req, res) => {
    try {
        const results = await getBarList();
        res.json(results);
    } catch (error) {
        console.error('getBarList error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

barListRouter.get('/bar/bar-list', async (req, res) => {
    try {
        const { bar_area_id, bar_type_id } = req.query;
        const results = await getFilteredBarList({ bar_area_id, bar_type_id });
        res.json(results);
    } catch (error) {
        console.error('getFilteredBarList error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

barListRouter.get(bar.getBarListId, async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarListId(bar_id);
        res.json(results);
    } catch (error) {
        console.error('getBarListId error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

// 依據bar-type-id篩選

export default barListRouter;
