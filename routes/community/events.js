import express from 'express';
import { community } from '../apiConfig.js';
import {
    getEvents,
    attendEvent,
    notAttendEvent,
    isAttendedEvent,
    checkEventStatus,
    deleteEvent,
    getEventPage,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getEvents, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const results = await getEvents(page, limit);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.post(community.attendEvent, authenticate, async (req, res) => {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return sendError(res, '必須提供活動ID和用戶ID', 400);
    }

    try {
        const results = await attendEvent(eventId, userId);
        sendSuccess(res, results, '參加活動成功');
    } catch (err) {
        sendError(res, '參加活動失敗', 500, err);
    }
});

router.delete(community.notAttendEvent, authenticate, async (req, res) => {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return sendError(res, '必須提供貼文ID和用戶ID', 400);
    }

    try {
        const results = await notAttendEvent(eventId, userId);
        sendSuccess(res, results, '取消參加活動成功');
    } catch (err) {
        sendError(res, '取消活動失敗', 500, err);
    }
});

router.get(community.isAttendedEvent, authenticate, async (req, res) => {
    try {
        const { eventId, userId } = req.query;

        if (!eventId || !userId) {
            return sendError(res, '必須提供貼文ID(eventId)和用戶ID', 400);
        }

        const isAttended = await isAttendedEvent(eventId, userId);
        sendSuccess(res, { isAttended });
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.get(community.checkEventStatus, authenticate, async (req, res) => {
    try {
        const { userId, eventIds } = req.query;
        if (!userId || !eventIds) {
            return sendError(res, '需要提供 userId 和 eventIds', 400);
        }
        const eventIdArray = eventIds.split(',').map((id) => parseInt(id.trim()));
        const results = await checkEventStatus(userId, eventIdArray);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.delete(community.deleteEvent, authenticate, async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) {
        return sendError(res, '需要提供 eventId', 400);
    }
    try {
        const results = await deleteEvent(eventId);
        sendSuccess(res, results, '刪除活動成功');
    } catch (err) {
        sendError(res, '刪除活動失敗', 500, err);
    }
});

router.get(community.getEventPage, async (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
        return sendError(res, '需要提供 eventId', 400);
    }

    try {
        const results = await getEventPage(eventId);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '內部伺服器錯誤', 500, error);
    }
});

export default router;
