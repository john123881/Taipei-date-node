import express from 'express';
import { community } from '../apiConfig.js';
import { searchUsers } from '../../services/index.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.searchUsers, async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return sendError(res, '需要提供 searchTerm', 400);
        }

        const results = await searchUsers(searchTerm);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

export default router;
