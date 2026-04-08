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
    editComment,
    getPostsByKeyword,
    getNoti,
    markNotiAsRead,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { 
    getPostsByKeywordSchema, 
    getCommentsSchema, 
    postInteractionSchema,
    checkPostStatusSchema,
    deletePostSchema,
    deleteCommentSchema,
    editCommentSchema 
} from '../../schemas/community.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getPostsByKeyword, validate(getPostsByKeywordSchema), async (req, res) => {
    try {
        const { keyword, page, limit, seed } = req.query;

        const results = await getPostsByKeyword(keyword, page, limit, seed);
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
        const seed = req.query.seed || null;
        const results = await getPosts(page, limit, seed);
        sendSuccess(res, results);
    } catch (error) {
        console.error('getPosts error:', error);
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.get(community.getComments, validate(getCommentsSchema), async (req, res) => {
    try {
        const { postIds } = req.query;

        const results = await getComments(postIds);
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

router.post(community.savePost, authenticate, validate(postInteractionSchema), async (req, res) => {
    const { postId, userId } = req.body;

    try {
        const results = await savePost(postId, userId);
        sendSuccess(res, results, '收藏貼文成功');
    } catch (err) {
        console.error('savePost error:', err);
        sendError(res, '收藏貼文失敗', 500, err);
    }
});

router.delete(community.unsavePost, authenticate, validate(postInteractionSchema), async (req, res) => {
    const { postId, userId } = req.body;

    try {
        const results = await unsavePost(postId, userId);
        sendSuccess(res, results, '移除收藏貼文成功');
    } catch (err) {
        console.error('unsavePost error:', err);
        sendError(res, '移除收藏貼文失敗', 500, err);
    }
});

router.post(community.likePost, authenticate, validate(postInteractionSchema), async (req, res) => {
    const { postId, userId } = req.body;

    try {
        const results = await likePost(postId, userId);
        sendSuccess(res, results, '喜愛貼文成功');
    } catch (err) {
        console.error('likePost error:', err);
        sendError(res, '喜愛貼文失敗', 500, err);
    }
});

router.delete(community.unlikePost, authenticate, validate(postInteractionSchema), async (req, res) => {
    const { postId, userId } = req.body;

    try {
        const results = await unlikePost(postId, userId);
        sendSuccess(res, results, '移除喜愛貼文成功');
    } catch (err) {
        console.error('unlikePost error:', err);
        sendError(res, '移除喜愛貼文失敗', 500, err);
    }
});

router.get(community.checkPostStatus, validate(checkPostStatusSchema), async (req, res) => {
    try {
        const { userId, postIds } = req.query;

        const results = await checkPostStatus(userId, postIds);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] checkPostStatus:', error);
        sendError(res, '檢查貼文狀態時發生內部錯誤', 500, error.message);
    }
});

router.delete(community.deletePost, authenticate, validate(deletePostSchema), async (req, res) => {
    const { postId } = req.body;
    try {
        const results = await deletePost(postId);
        sendSuccess(res, results, '刪除貼文成功');
    } catch (err) {
        sendError(res, '刪除貼文失敗', 500, err);
    }
});

router.delete(community.deleteComment, authenticate, validate(deleteCommentSchema), async (req, res) => {
    const { commentId } = req.body;

    try {
        const results = await deleteComment(commentId);
        sendSuccess(res, results, '刪除留言成功');
    } catch (err) {
        sendError(res, '刪除留言失敗', 500, err);
    }
});

router.put(community.editComment, authenticate, validate(editCommentSchema), async (req, res) => {
    const { commentId, context } = req.body;

    try {
        const results = await editComment(commentId, context);
        sendSuccess(res, results, '修改留言成功');
    } catch (err) {
        sendError(res, '修改留言失敗', 500, err);
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
