import express from 'express';
import { community } from '../apiConfig.js';
import {
    getPosts,
    getUserPosts,
    getFollows,
    getCountPosts,
    getUserInfo,
    follow,
    unfollow,
    checkFollowStatus,
    getFollowers,
    getFollowings,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getPosts, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getPosts(page, limit);
    sendSuccess(res, results);
});

router.get(community.getUserPosts, async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const results = await getUserPosts(userId, page, limit);

        if (!results || results.length === 0) {
            return sendSuccess(res, []);
        }

        const newResults = results.map((obj) => ({ ...obj }));
        sendSuccess(res, newResults);
    } catch (error) {
        sendError(res, '獲取貼文失敗', 500, error);
    }
});

router.get(community.getFollows, async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await getFollows(userId, userId);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.get(community.getCountPosts, async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await getCountPosts(userId);
        res.json(results);
    } catch (error) {
        console.error('getCountPosts error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

router.get(community.getUserInfo, async (req, res) => {
    const { userId } = req.params;
    const results = await getUserInfo(userId);
    sendSuccess(res, results);
});

router.post(community.follow, authenticate, async (req, res) => {
    const { userId, followingId } = req.body;

    if (!userId || !followingId) {
        return sendError(res, '必須提供 userId 和 followingId', 400);
    }

    try {
        const results = await follow(userId, followingId);
        sendSuccess(res, results, '追蹤成功');
    } catch (err) {
        sendError(res, '追蹤失敗', 500, err);
    }
});

router.delete(community.unfollow, authenticate, async (req, res) => {
    const { userId, followingId } = req.body;

    if (!userId || !followingId) {
        return sendError(res, '必須提供 userId 和 followingId', 400);
    }

    try {
        const results = await unfollow(userId, followingId);
        sendSuccess(res, results, '取消追蹤成功');
    } catch (err) {
        sendError(res, '取消追蹤失敗', 500, err);
    }
});

router.get(community.checkFollowStatus, authenticate, async (req, res) => {
    const { userId, followingId } = req.query;

    if (!userId || !followingId) {
        return sendError(res, '需要提供 userId 和 followingId', 400);
    }
    try {
        const result = await checkFollowStatus(userId, followingId);
        sendSuccess(res, result);
    } catch (err) {
        sendError(res, 'Error checking follow status', 500, err);
    }
});

router.get(community.getFollowers, async (req, res) => {
    const { followingId } = req.params;

    if (!followingId) {
        return sendError(res, '需要提供 followingId', 400);
    }

    try {
        const result = await getFollowers(followingId);
        sendSuccess(res, result);
    } catch (err) {
        sendError(res, 'Error checking followers', 500, err);
    }
});

router.get(community.getFollowings, async (req, res) => {
    const { followerId } = req.params;

    if (!followerId) {
        return sendError(res, '需要提供 followerId', 400);
    }

    try {
        const result = await getFollowings(followerId);
        sendSuccess(res, result);
    } catch (err) {
        sendError(res, 'Error checking followings', 500, err);
    }
});

export default router;
