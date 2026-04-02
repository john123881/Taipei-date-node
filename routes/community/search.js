import express from 'express';
import { community } from '../apiConfig.js';
import { searchUsers } from '../../services/index.js';
import { validate } from '../../middlewares/validate.js';
import { searchUsersSchema } from '../../schemas/community.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.searchUsers, validate(searchUsersSchema), async (req, res) => {
    try {
        const { searchTerm } = req.query;

        const results = await searchUsers(searchTerm);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] searchUsers:', error);
        sendError(res, '搜尋使用者時發生內部錯誤', 500, error.message);
    }
});

export default router;
