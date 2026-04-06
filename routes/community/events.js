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
    getParticipants,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { 
    getEventPageSchema, 
    eventInteractionSchema, 
    checkEventStatusSchema,
    deleteEventSchema
} from '../../schemas/community.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

router.get(community.getEvents, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const seed = req.query.seed || null;
        const results = await getEvents(page, limit, seed);
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

router.post(community.attendEvent, authenticate, validate(eventInteractionSchema), async (req, res) => {
    const { eventId, userId } = req.body;

    try {
        const results = await attendEvent(eventId, userId);
        sendSuccess(res, results, '參加活動成功');
    } catch (err) {
        console.error('[Route Error] attendEvent:', err);
        sendError(res, '參加活動失敗', 500, err.message);
    }
});

router.delete(community.notAttendEvent, authenticate, validate(eventInteractionSchema), async (req, res) => {
    const { eventId, userId } = req.body;

    try {
        const results = await notAttendEvent(eventId, userId);
        sendSuccess(res, results, '取消參加活動成功');
    } catch (err) {
        console.error('[Route Error] notAttendEvent:', err);
        sendError(res, '取消活動失敗', 500, err.message);
    }
});

router.get(community.isAttendedEvent, authenticate, validate(eventInteractionSchema), async (req, res) => {
    try {
        const { eventId, userId } = req.query;

        const isAttended = await isAttendedEvent(eventId, userId);
        sendSuccess(res, { isAttended });
    } catch (error) {
        console.error('[Route Error] isAttendedEvent:', error);
        sendError(res, '檢查活動狀態失敗', 500, error.message);
    }
});

router.get(community.checkEventStatus, authenticate, validate(checkEventStatusSchema), async (req, res) => {
    try {
        const { userId, eventIds } = req.query;

        const results = await checkEventStatus(userId, eventIds);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] checkEventStatus:', error);
        sendError(res, '檢查活動狀態時發生錯誤', 500, error.message);
    }
});

router.delete(community.deleteEvent, authenticate, validate(deleteEventSchema), async (req, res) => {
    const { eventId } = req.body;
    try {
        const results = await deleteEvent(eventId);
        sendSuccess(res, results, '刪除活動成功');
    } catch (err) {
        console.error('[Route Error] deleteEvent:', err);
        sendError(res, '刪除活動失敗', 500, err.message);
    }
});

router.get(community.getEventPage, validate(getEventPageSchema), async (req, res) => {
    const { eventId } = req.params;

    try {
        const results = await getEventPage(eventId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getEventPage:', error);
        sendError(res, '獲取活動詳情時發生錯誤', 500, error.message);
    }
});

router.get(community.getParticipants, async (req, res) => {
    const { eventId } = req.params;
    try {
        const results = await getParticipants(eventId);
        sendSuccess(res, results);
    } catch (error) {
        console.error('[Route Error] getParticipants:', error);
        sendError(res, '獲取活動參與者時發生錯誤', 500, error.message);
    }
});

export default router;
