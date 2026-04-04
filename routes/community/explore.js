import express from 'express';
import { community } from '../apiConfig.js';
import { getRandomPosts } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getRandomPosts, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const seed = req.query.seed || null;
        const results = await getRandomPosts(page, limit, seed);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default router;
