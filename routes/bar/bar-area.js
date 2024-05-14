import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarArea, getBarAreaById } from '../../services/index.js';

const barAreaRouter = express.Router();

barAreaRouter.get(bar.getBarArea, async (req, res) => {
    const { bar_area_id } = req.params;
    //   const results = await getBarArea();
    const results = await getBarAreaById(bar_area_id);
    res.json(results);
});

barAreaRouter.get('/bar-area', async (req, res) => {
    try {
        const results = await getBarArea();
        res.json(results);
    } catch (error) {
        console.error('Error fetching all bars:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default barAreaRouter;
