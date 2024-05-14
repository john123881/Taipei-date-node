import express from 'express';
import { community } from '../apiConfig.js';
import { getRandomPosts } from '../../services/index.js';

const router = express.Router();

router.get(community.getRandomPosts, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getRandomPosts(page, limit);
    res.json(results);
});

export default router;
