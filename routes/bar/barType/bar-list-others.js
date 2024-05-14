import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListOthers } from '../../../services/index.js';

const barListOthersRouter = express.Router();

// Sports bars
barListOthersRouter.get(bar.getBarListOthers, async (_req, res) => {
    const results = await getBarListOthers();
    res.json(results);
});

export default barListOthersRouter;
