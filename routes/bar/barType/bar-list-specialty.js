import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListSpecialty } from '../../../services/index.js';

const barListSpecialtyRouter = express.Router();

// Sports bars
barListSpecialtyRouter.get(bar.getBarListSpecialty, async (_req, res) => {
    const results = await getBarListSpecialty();
    res.json(results);
});

export default barListSpecialtyRouter;
