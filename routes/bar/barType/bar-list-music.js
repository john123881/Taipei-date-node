import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListMusic } from '../../../services/index.js';

const barListMusicRouter = express.Router();

// Sports bars
barListMusicRouter.get(bar.getBarListMusic, async (_req, res) => {
    const results = await getBarListMusic();
    res.json(results);
});

export default barListMusicRouter;
