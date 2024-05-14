import express from 'express';
import { community } from '../apiConfig.js';
import {
    getPosts,
    getComments,
    getSuggestUsers,
    savePost,
    unsavePost,
    likePost,
    unlikePost,
    checkPostStatus,
    deletePost,
    deleteComment,
    getPostsByKeyword,
    getNoti,
    markNotiAsRead,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';

const router = express.Router();

router.get(community.getPostsByKeyword, async (req, res) => {
    const { keyword } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文

    if (!keyword) {
        return res.status(400).json({
            status: false,
            message: '需要提供 keyword',
        });
    }

    const results = await getPostsByKeyword(keyword, page, limit);
    res.json(results);
});

router.get(community.getPosts, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getPosts(page, limit);
    res.json(results);
});

router.get(community.getComments, async (req, res) => {
    const { postIds } = req.query;
    if (!postIds) {
        return res.status(400).json({
            status: false,
            message: '需要提供 postIds',
        });
    }
    const postIdArray = postIds.split(',').map((id) => parseInt(id.trim()));
    const results = await getComments(postIdArray);
    res.json(results);
});

router.get(community.getSuggestUsers, async (req, res) => {
    const results = await getSuggestUsers();
    res.json(results);
});

router.post(community.savePost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    try {
        const results = await savePost(postId, userId);
        return res.status(201).json({
            status: true,
            message: '收藏貼文成功',
            data: results,
        });
    } catch (err) {
        console.error('收藏貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '收藏貼文失敗',
            error: err.message,
        });
    }
});

router.delete(community.unsavePost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    try {
        const results = await unsavePost(postId, userId);
        return res.status(201).json({
            status: true,
            message: '移除收藏貼文成功',
            data: results,
        });
    } catch (err) {
        console.error('移除收藏貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '移除收藏貼文失敗',
            error: err.message,
        });
    }
});

router.post(community.likePost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    try {
        const results = await likePost(postId, userId);
        return res.status(201).json({
            status: true,
            message: '喜愛貼文成功',
            data: results,
        });
    } catch (err) {
        console.error('喜愛貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '喜愛貼文失敗',
            error: err.message,
        });
    }
});

router.delete(community.unlikePost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    try {
        const results = await unlikePost(postId, userId);
        return res.status(201).json({
            status: true,
            message: '移除喜愛貼文成功',
            data: results,
        });
    } catch (err) {
        console.error('移除喜愛貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '移除喜愛貼文失敗',
            error: err.message,
        });
    }
});

router.get(community.checkPostStatus, async (req, res) => {
    const { userId, postIds } = req.query;
    if (!userId || !postIds) {
        return res.status(400).json({
            status: false,
            message: '需要提供 userId 和 postIds',
        });
    }
    const postIdArray = postIds.split(',').map((id) => parseInt(id.trim()));
    const results = await checkPostStatus(userId, postIdArray);
    res.json(results);
});

router.delete(community.deletePost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { postId } = req.body;
    if (!postId) {
        return res.status(400).json({
            status: false,
            message: '需要提供postId',
        });
    }
    try {
        const results = await deletePost(postId);
        return res.status(201).json({
            status: true,
            message: '刪除貼文成功',
            data: results,
        });
    } catch (err) {
        console.error('刪除貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '刪除貼文失敗',
            error: err.message,
        });
    }
});

router.delete(community.deleteComment, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { commentId } = req.body;

    if (!commentId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 commentId',
        });
    }
    try {
        const results = await deleteComment(commentId);
        return res.status(201).json({
            status: true,
            message: '刪除貼文成功',
            data: results,
        });
    } catch (err) {
        console.error('刪除貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '刪除貼文失敗',
            error: err.message,
        });
    }
});

router.get(community.getNoti, async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 userId',
        });
    }
    try {
        const results = await getNoti(userId);
        return res.status(201).json({
            status: true,
            message: '獲取通知成功',
            noti: results,
        });
    } catch (err) {
        console.error('獲取通知錯誤:', err);
        res.status(500).json({
            status: false,
            message: '獲取通知失敗',
            error: err.message,
        });
    }
});

router.post(community.markNotiAsRead, async (req, res) => {
    const { notiId } = req.params;
    const { userId } = req.body; // 從請求體中獲取 userId

    if (!userId || !notiId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 userId 和 notiId',
        });
    }
    try {
        const results = await markNotiAsRead(notiId, userId);
        return res.status(201).json({
            status: true,
            message: '已讀通知成功',
            noti: results,
        });
    } catch (err) {
        console.error('已讀通知錯誤:', err);
        res.status(500).json({
            status: false,
            message: '已讀通知失敗',
            error: err.message,
        });
    }
});

export default router;
