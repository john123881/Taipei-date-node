import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarList, getBarListId } from '../../services/index.js';
import db from '../../utils/mysql2-connect.js';

const barListRouter = express.Router();

barListRouter.get(bar.getBarList, async (_req, res) => {
    const results = await getBarList();
    res.json(results);
});

barListRouter.get('/bar/bar-list', async (req, res) => {
    const barAreaId = req.query.bar_area_id;
    const barTypeId = req.query.bar_type_id;
    let sql = `
    SELECT 
        bars.*, 
        bar_area.bar_area_name, 
        bar_type.bar_type_name
    FROM 
        bars
    LEFT JOIN 
        bar_area ON bars.bar_area_id = bar_area.bar_area_id
    LEFT JOIN 
        bar_type ON bars.bar_type_id = bar_type.bar_type_id
    `;
    const params = [];

    if (barAreaId) {
        sql += ' AND bar_area_id = ?';
        params.push(barAreaId);
    }
    if (barTypeId) {
        sql += ' AND bar_type_id = ?';
        params.push(barTypeId);
    }

    try {
        const [results] = await db.query(sql, params);
        res.json(results);
    } catch (error) {
        console.error('Failed to fetch bars:', error);
        res.status(500).send('Server error');
    }
});

barListRouter.get(bar.getBarListId, async (req, res) => {
    const { bar_id } = req.params;
    console.log(bar_id);
    const results = await getBarListId(bar_id);
    res.json(results);
});

// 依據bar-type-id篩選

export default barListRouter;
