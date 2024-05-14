import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListSport } from '../../../services/index.js';

const barListSportRouter = express.Router();

// Sports bars
barListSportRouter.get(bar.getBarListSport, async (_req, res) => {
    const results = await getBarListSport();
    res.json(results);
});

export default barListSportRouter;
