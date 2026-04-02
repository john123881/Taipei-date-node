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
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getPostsByKeyword, async (req, res) => {
    try {
        const { keyword } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
            return sendError(res, '需要提供有效關鍵字', 400);
        }

        const results = await getPostsByKeyword(keyword.trim(), page, limit);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getPostsByKeyword:', error);
        sendError(res, '搜尋貼文時發生內部錯誤', 500, error.message);
    }
});

router.get(community.getPosts, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const results = await getPosts(page, limit);
        sendSuccess(res, results);
    } catch (error) {
        console.error('getPosts error:', error);
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.get(community.getComments, async (req, res) => {
    try {
        const { postIds } = req.query;
        if (!postIds) {
            return sendError(res, '需要提供 postIds', 400);
        }
        
        // 強化參數處理：支援逗號分隔字串或陣列
        const postIdArray = (typeof postIds === 'string' ? postIds.split(',') : (Array.isArray(postIds) ? postIds : [postIds]))
            .map((id) => parseInt(String(id).trim()))
            .filter(id => !isNaN(id));

        if (postIdArray.length === 0) {
            return sendSuccess(res, []);
        }

        const results = await getComments(postIdArray);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getComments:', error);
        sendError(res, '獲取留言時發生內部錯誤', 500, error.message);
    }
});

router.get(community.getSuggestUsers, async (req, res) => {
    try {
        const results = await getSuggestUsers();
        sendSuccess(res, results);
    } catch (error) {
        console.error('getSuggestUsers error:', error);
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.post(community.savePost, authenticate, async (req, res) => {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return sendError(res, '必須提供貼文ID和用戶ID', 400);
    }

    try {
        const results = await savePost(postId, userId);
        sendSuccess(res, results, '收藏貼文成功');
    } catch (err) {
        console.error('savePost error:', err);
        sendError(res, '收藏貼文失敗', 500, err);
    }
});

router.delete(community.unsavePost, authenticate, async (req, res) => {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return sendError(res, '必須提供貼文ID和用戶ID', 400);
    }

    try {
        const results = await unsavePost(postId, userId);
        sendSuccess(res, results, '移除收藏貼文成功');
    } catch (err) {
        console.error('unsavePost error:', err);
        sendError(res, '移除收藏貼文失敗', 500, err);
    }
});

router.post(community.likePost, authenticate, async (req, res) => {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return sendError(res, '必須提供貼文ID和用戶ID', 400);
    }

    try {
        const results = await likePost(postId, userId);
        sendSuccess(res, results, '喜愛貼文成功');
    } catch (err) {
        console.error('likePost error:', err);
        sendError(res, '喜愛貼文失敗', 500, err);
    }
});

router.delete(community.unlikePost, authenticate, async (req, res) => {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return sendError(res, '必須提供貼文ID和用戶ID', 400);
    }

    try {
        const results = await unlikePost(postId, userId);
        sendSuccess(res, results, '移除喜愛貼文成功');
    } catch (err) {
        console.error('unlikePost error:', err);
        sendError(res, '移除喜愛貼文失敗', 500, err);
    }
});

router.get(community.checkPostStatus, async (req, res) => {
    try {
        const { userId, postIds } = req.query;
        if (!userId || !postIds) {
            return sendError(res, '需要提供 userId 和 postIds', 400);
        }

        const postIdArray = (typeof postIds === 'string' ? postIds.split(',') : (Array.isArray(postIds) ? postIds : [postIds]))
            .map((id) => parseInt(String(id).trim()))
            .filter(id => !isNaN(id));

        if (postIdArray.length === 0) {
            return sendSuccess(res, {});
        }

        const results = await checkPostStatus(userId, postIdArray);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] checkPostStatus:', error);
        sendError(res, '檢查貼文狀態時發生內部錯誤', 500, error.message);
    }
});

router.delete(community.deletePost, authenticate, async (req, res) => {
    const { postId } = req.body;
    if (!postId) {
        return sendError(res, '需要提供postId', 400);
    }
    try {
        const results = await deletePost(postId);
        sendSuccess(res, results, '刪除貼文成功');
    } catch (err) {
        sendError(res, '刪除貼文失敗', 500, err);
    }
});

router.delete(community.deleteComment, authenticate, async (req, res) => {
    const { commentId } = req.body;

    if (!commentId) {
        return sendError(res, '需要提供 commentId', 400);
    }
    try {
        const results = await deleteComment(commentId);
        sendSuccess(res, results, '刪除留言成功');
    } catch (err) {
        sendError(res, '刪除留言失敗', 500, err);
    }
});

router.get(community.getNoti, async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return sendError(res, '需要提供 userId', 400);
    }
    try {
        const results = await getNoti(userId);
        sendSuccess(res, results, '獲取通知成功');
    } catch (err) {
        sendError(res, '獲取通知失敗', 500, err);
    }
});

router.post(community.markNotiAsRead, async (req, res) => {
    const { notiId } = req.params;
    const { userId } = req.body;

    if (!userId || !notiId) {
        return sendError(res, '需要提供 userId 和 notiId', 400);
    }
    try {
        const results = await markNotiAsRead(notiId, userId);
        sendSuccess(res, results, '已讀通知成功');
    } catch (err) {
        sendError(res, '已讀通知失敗', 500, err);
    }
});

export default router;
