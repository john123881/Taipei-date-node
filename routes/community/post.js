import express from 'express';
import { community } from '../apiConfig.js';
import { getPostPage } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getPostPage, async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return sendError(res, '需要提供 postId', 400);
        }

        const results = await getPostPage(postId);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '內部伺服器錯誤', 500, error);
    }
});

export default router;
