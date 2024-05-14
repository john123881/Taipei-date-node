import express from 'express';
import { community } from '../apiConfig.js';
import { getPostPage } from '../../services/index.js';

const router = express.Router();

router.get(community.getPostPage, async (req, res) => {
    const { postId } = req.params;

    if (!postId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 postId',
        });
    }

    try {
        const results = await getPostPage(postId);
        res.json(results);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: '內部伺服器錯誤',
            error: error.message,
        });
    }
});

export default router;
