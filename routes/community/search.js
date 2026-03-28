import express from 'express';
import { community } from '../apiConfig.js';
import { searchUsers } from '../../services/index.js';

const router = express.Router();

router.get(community.searchUsers, async (req, res) => {
    try {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({
                status: false,
                message: '需要提供 searchTerm',
            });
        }

        const results = await searchUsers(searchTerm);
        res.json(results);
    } catch (error) {
        console.error('searchUsers error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default router;
