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

const router = express.Router();

router.get(community.getPosts, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getPosts(page, limit);
    res.json(results);
});

router.get(community.getUserPosts, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功
    // const output = {
    //     success: false,
    //     action: '', // add, remove
    //     error: '',
    //     code: 0,
    //     data: [],
    // };

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getUserPosts(userId, page, limit);

    if (!results) {
        output.success = false;
        output.code = 440;
        output.error = '沒有該筆資料';
        return res.json(output);
    }

    // add success status to results
    const newResults = results.map((obj) => ({ ...obj, success: true }));

    res.json(newResults);
});

router.get(community.getFollows, async (req, res) => {
    const { userId } = req.params;
    const results = await getFollows(userId, userId);
    res.json(results);
});

router.get(community.getCountPosts, async (req, res) => {
    const { userId } = req.params;
    const results = await getCountPosts(userId);
    res.json(results);
});

router.get(community.getUserInfo, async (req, res) => {
    const { userId } = req.params;
    const results = await getUserInfo(userId);
    res.json(results);
});

router.post(community.follow, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    // const output = {
    //     success: false,
    //     action: '', // add, remove
    //     error: '',
    //     code: 0,
    //     data: [],
    // };

    const { userId, FollowingId } = req.body;

    if (!userId || !FollowingId) {
        return res.status(400).json({
            status: false,
            message: '必須提供活動ID和用戶ID',
        });
    }

    try {
        const results = await follow(userId, FollowingId);

        // if (!results) {
        //     output.success = false;
        //     output.code = 440;
        //     output.error = '沒有該筆資料';
        //     return res.json(output);
        // }

        return res.status(201).json({
            status: true,
            message: '追蹤成功',
            data: results,
        });
    } catch (err) {
        console.error('追蹤錯誤:', err);
        res.status(500).json({
            status: false,
            message: '追蹤失敗',
            error: err.message,
        });
    }
});

router.delete(community.unfollow, authenticate, async (req, res) => {
    const { userId, FollowingId } = req.body;

    if (!userId || !FollowingId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    try {
        const results = await unfollow(userId, FollowingId);

        return res.status(201).json({
            status: true,
            message: '取消追蹤成功',
            data: results,
        });
    } catch (err) {
        console.error('取消追蹤錯誤:', err);
        res.status(500).json({
            status: false,
            message: '取消追蹤失敗',
            error: err.message,
        });
    }
});

router.get(community.checkFollowStatus, authenticate, async (req, res) => {
    const { userId, followingId } = req.query;

    if (!userId || !followingId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 userId 和 followingId',
        });
    }
    try {
        const result = await checkFollowStatus(userId, followingId);
        res.json(result);
    } catch (err) {
        console.error('Error checking follow status:', err);
        res.status(500).json({
            message: 'Error checking follow status',
            error: err.message,
        });
    }
});

router.get(community.getFollowers, async (req, res) => {
    const { followingId } = req.params;

    if (!followingId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 followingId',
        });
    }

    try {
        const result = await getFollowers(followingId);
        res.json(result);
    } catch (err) {
        console.error('Error checking followers:', err);
        res.status(500).json({
            message: 'Error checking followers',
            error: err.message,
        });
    }
});

router.get(community.getFollowings, async (req, res) => {
    const { followerId } = req.params;

    if (!followerId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 followerId',
        });
    }

    try {
        const result = await getFollowings(followerId);
        res.json(result);
    } catch (err) {
        console.error('Error checking followings:', err);
        res.status(500).json({
            message: 'Error checking followings',
            error: err.message,
        });
    }
});

export default router;
