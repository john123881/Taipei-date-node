import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarType, getBarTypeById } from '../../services/index.js';

const barTypeRouter = express.Router();

barTypeRouter.get(bar.getBarType, async (req, res) => {
  const { bar_type_id } = req.params;
  // const results = await getBarType();
  const results = await getBarTypeById(bar_type_id);
  res.json(results);
});

barTypeRouter.get('/bar-type', async (req, res) => {
    try {
        const results = await getBarType();
        res.json(results);
    } catch (error) {
        console.error('Error fetching all bars:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default barTypeRouter;