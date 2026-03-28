import express from 'express';
import { community } from '../apiConfig.js';
import { getRandomPosts } from '../../services/index.js';

const router = express.Router();

router.get(community.getRandomPosts, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const results = await getRandomPosts(page, limit);
        res.json(results);
    } catch (error) {
        console.error('getRandomPosts error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
