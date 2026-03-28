import express from 'express';
import { bar } from '../../apiConfig.js';
import { getBarListMusic } from '../../../services/index.js';

const barListMusicRouter = express.Router();

// Sports bars
barListMusicRouter.get(bar.getBarListMusic, async (req, res) => {
    try {
        const results = await getBarListMusic();
        res.json(results);
    } catch (error) {
        console.error('getBarListMusic error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barListMusicRouter;
