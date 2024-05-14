import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListForeign } from '../../../services/index.js';

const barListForeignRouter = express.Router();

// Sports bars
barListForeignRouter.get(bar.getBarListForeign, async (_req, res) => {
    const results = await getBarListForeign();
    res.json(results);
});

export default barListForeignRouter;
