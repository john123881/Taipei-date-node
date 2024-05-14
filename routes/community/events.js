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

const router = express.Router();

router.get(community.getEvents, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 默認每頁12個貼文
    const results = await getEvents(page, limit);
    res.json(results);
});

router.post(community.attendEvent, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供活動ID和用戶ID',
        });
    }

    try {
        const results = await attendEvent(eventId, userId);
        return res.status(201).json({
            status: true,
            message: '參加活動成功',
            data: results,
        });
    } catch (err) {
        console.error('參加活動錯誤:', err);
        res.status(500).json({
            status: false,
            message: '參加活動失敗',
            error: err.message,
        });
    }
});

router.delete(community.notAttendEvent, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    try {
        const results = await notAttendEvent(eventId, userId);
        return res.status(201).json({
            status: true,
            message: '取消參加活動成功',
            data: results,
        });
    } catch (err) {
        console.error('取消參加活動錯誤:', err);
        res.status(500).json({
            status: false,
            message: '取消活動失敗',
            error: err.message,
        });
    }
});

router.get(community.isAttendedEvent, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { eventId, userId } = req.query;

    if (!eventId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文ID和用戶ID',
        });
    }

    const isAttended = await isAttendedEvent(eventId, userId);
    res.json({ isAttended });
});

router.get(community.checkEventStatus, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { userId, eventIds } = req.query;
    if (!userId || !eventIds) {
        return res.status(400).json({
            status: false,
            message: '需要提供 userId 和 eventIds',
        });
    }
    const eventIdArray = eventIds.split(',').map((id) => parseInt(id.trim()));
    const results = await checkEventStatus(userId, eventIdArray);
    res.json(results);
});

router.delete(community.deleteEvent, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { eventId } = req.body;
    if (!eventId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 eventId',
        });
    }
    try {
        const results = await deleteEvent(eventId);
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

router.get(community.getEventPage, async (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
        return res.status(400).json({
            status: false,
            message: '需要提供 eventId',
        });
    }

    try {
        const results = await getEventPage(eventId);
        res.json(results);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: '內部伺服器錯誤',
            error: error.message,
        });
    }
});

export default router;
