import express from 'express';
import { bar } from '../apiConfig.js';
import {getBarListRandom} from '../../services/index.js';

const barListRadomRouter = express.Router();

barListRadomRouter.get(bar.getBarListRandom, async (_req, res) => {
    const results = await getBarListRandom();
    res.json(results);
});


export default barListRadomRouter;
