import express from 'express';
import { community } from '../apiConfig.js';
import { getPostPage } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { getPostPageSchema } from '../../schemas/community.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getPostPage, validate(getPostPageSchema), async (req, res) => {
    try {
        const { postId } = req.params;

        const results = await getPostPage(postId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getPostPage:', error);
        sendError(res, '獲取貼文詳情時發生錯誤', 500, error.message);
    }
});

export default router;
