import express from 'express';
import { community } from '../apiConfig.js';
import {
    getPosts,
    getUserPosts,
    getEventsByUser,
    getEventsCountByUserId,
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
import { validate } from '../../middlewares/validate.js';
import { 
    getUserPostsSchema, 
    followUserSchema, 
    followingIdSchema, 
    followerIdSchema 
} from '../../schemas/community.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getPosts, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getPosts(page, limit);
    sendSuccess(res, results);
});

router.get(community.getUserPosts, validate(getUserPostsSchema), async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const results = await getUserPosts(userId, page, limit);

        sendSuccess(res, results || []);
    } catch (error) {
        console.error('[Route Error] getUserPosts:', error);
        sendError(res, '獲取貼文失敗', 500, error.message);
    }
});

router.get(community.getUserEvents, validate(getUserPostsSchema), async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const results = await getEventsByUser(userId, page, limit);

        sendSuccess(res, results || []);
    } catch (error) {
        console.error('[Route Error] getUserEvents:', error);
        sendError(res, '獲取活動失敗', 500, error.message);
    }
});

router.get(community.getFollows, validate(getUserPostsSchema), async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await getFollows(userId, userId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getFollows:', error);
        sendError(res, '獲取追蹤資訊失敗', 500, error.message);
    }
});

router.get(community.getCountPosts, validate(getUserPostsSchema), async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await getCountPosts(userId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getCountPosts:', error);
        sendError(res, '獲取貼文數量失敗', 500, error.message);
    }
});

router.get(community.getCountEvents, validate(getUserPostsSchema), async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await getEventsCountByUserId(userId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getCountEvents:', error);
        sendError(res, '獲取活動數量失敗', 500, error.message);
    }
});

router.get(community.getUserInfo, validate(getUserPostsSchema), async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await getUserInfo(userId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getUserInfo:', error);
        sendError(res, '獲取用戶資訊失敗', 500, error.message);
    }
});

router.post(community.follow, authenticate, validate(followUserSchema), async (req, res) => {
    const { userId, followingId } = req.body;

    try {
        const results = await follow(userId, followingId);
        sendSuccess(res, results, '追蹤成功');
    } catch (err) {
        console.error('[Route Error] follow:', err);
        sendError(res, '追蹤失敗', 500, err.message);
    }
});

router.delete(community.unfollow, authenticate, validate(followUserSchema), async (req, res) => {
    const { userId, followingId } = req.body;

    try {
        const results = await unfollow(userId, followingId);
        sendSuccess(res, results, '取消追蹤成功');
    } catch (err) {
        console.error('[Route Error] unfollow:', err);
        sendError(res, '取消追蹤失敗', 500, err.message);
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
        console.error('[Route Error] checkFollowStatus:', err);
        sendError(res, '檢查追蹤狀態時發生錯誤', 500, err.message);
    }
});

router.get(community.getFollowers, validate(followingIdSchema), async (req, res) => {
    const { followingId } = req.params;

    try {
        const result = await getFollowers(followingId);
        sendSuccess(res, result);
    } catch (err) {
        console.error('[Route Error] getFollowers:', err);
        sendError(res, '獲取粉絲列表時發生錯誤', 500, err.message);
    }
});

router.get(community.getFollowings, validate(followerIdSchema), async (req, res) => {
    const { followerId } = req.params;

    try {
        const result = await getFollowings(followerId);
        sendSuccess(res, result);
    } catch (err) {
        console.error('[Route Error] getFollowings:', err);
        sendError(res, '獲取追蹤列表時發生錯誤', 500, err.message);
    }
});

export default router;
