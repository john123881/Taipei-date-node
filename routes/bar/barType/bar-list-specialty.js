import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListSpecialty } from '../../../services/index.js';

const barListSpecialtyRouter = express.Router();

// Sports bars
barListSpecialtyRouter.get(bar.getBarListSpecialty, async (req, res) => {
    try {
        const results = await getBarListSpecialty();
        res.json(results);
    } catch (error) {
        console.error('getBarListSpecialty error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barListSpecialtyRouter;
