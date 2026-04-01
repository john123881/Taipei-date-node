import express from 'express';
import fileUpload from 'express-fileupload';
import { community } from '../apiConfig.js';
import {
    uploadPhoto,
    createPost,
    uploadEventPhoto,
    createEvent,
    addComment,
    editPost,
    editPostPhoto,
    editEvent,
    editEventPhoto,
} from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { addCommentSchema, createPostSchema } from '../../schemas/community.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const router = express.Router();

// 啟動檔案上傳
router.use(
    fileUpload({
        createParentPath: true,
    })
);

router.post(community.createPost, authenticate, validate(createPostSchema), async (req, res) => {
    const { context, userId } = req.body;

    try {
        const newPost = await createPost(context, userId);
        sendSuccess(res, newPost, '貼文新增成功');
    } catch (err) {
        sendError(res, '貼文新增失敗', 500, err);
    }
});

router.post(community.uploadPhoto, authenticate, async (req, res) => {
    try {
        if (!req.files || !req.body.postId) {
            return sendError(res, '必須提供照片和貼文ID', 400);
        }

        let photo = req.files.photo;
        let postId = req.body.postId;

        if (!photo) {
            return sendError(res, '未上傳照片', 400);
        }

        try {
            const photoName = photo.name;
            const imageData = photo.data;

            const result = await uploadPhoto(photoName, postId, imageData);

            sendSuccess(res, result, '檔案已上傳並儲存到數據庫', {
                fileInfo: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                }
            });
        } catch (err) {
            sendError(res, 'Server error', 500, err);
        }
    } catch (err) {
        sendError(res, 'Server error', 500, err);
    }
});

router.post(community.createEvent, authenticate, async (req, res) => {
    const {
        title,
        description,
        status,
        location,
        userId,
        startDate,
        startTime,
        endDate,
        endTime,
    } = req.body;

    if (!title || !userId) {
        return sendError(res, '必須提供活動標題和用戶ID', 400);
    }

    try {
        const newEvent = await createEvent(
            title,
            description,
            status,
            location,
            userId,
            startDate,
            startTime,
            endDate,
            endTime
        );
        sendSuccess(res, newEvent, '活動新增成功');
    } catch (err) {
        sendError(res, '活動新增失敗', 500, err);
    }
});

router.post(community.uploadEventPhoto, authenticate, async (req, res) => {
    try {
        if (!req.files || !req.body.eventId) {
            return sendError(res, '必須提供照片和活動ID', 400);
        }

        let photo = req.files.photo;
        let eventId = req.body.eventId;

        if (!photo) {
            return sendError(res, '未上傳照片', 400);
        }

        try {
            const photoName = photo.name;
            const imageData = photo.data;

            const result = await uploadEventPhoto(
                photoName,
                eventId,
                imageData
            );

            sendSuccess(res, result, '檔案已上傳並儲存到數據庫', {
                fileInfo: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                }
            });
        } catch (err) {
            sendError(res, 'Server error', 500, err);
        }
    } catch (err) {
        sendError(res, 'Server error', 500, err);
    }
});

router.post(community.addComment, authenticate, validate(addCommentSchema), async (req, res) => {
    const { context, status, postId, userId } = req.body;

    try {
        const result = await addComment(context, status, postId, userId);
        sendSuccess(res, result, '回覆新增成功');
    } catch (err) {
        sendError(res, '回覆新增失敗', 500, err);
    }
});

router.put(community.editPost, authenticate, async (req, res) => {
    const { context, postId } = req.body;

    if (!context || !postId) {
        return sendError(res, '必須提供貼文內容和用戶ID', 400);
    }

    try {
        const result = await editPost(context, postId);
        sendSuccess(res, result, '貼文更新成功');
    } catch (err) {
        sendError(res, '貼文更新失敗', 500, err);
    }
});

router.put(community.editPostPhoto, authenticate, async (req, res) => {
    try {
        if (!req.files || !req.body.postId) {
            return sendError(res, '必須提供照片和貼文ID', 400);
        }

        let photo = req.files.photo;
        let postId = req.body.postId;

        if (!photo) {
            return sendError(res, '未上傳照片', 400);
        }
        try {
            const photoName = photo.name;
            const imageData = photo.data;

            const result = await editPostPhoto(photoName, imageData, postId);

            sendSuccess(res, result, '更新檔案已上傳並儲存到數據庫', {
                fileInfo: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                }
            });
        } catch (err) {
            sendError(res, 'Server error', 500, err);
        }
    } catch (err) {
        sendError(res, 'Server error', 500, err);
    }
});

router.put(community.editEvent, authenticate, async (req, res) => {
    const {
        title,
        description,
        location,
        startDate,
        startTime,
        endDate,
        endTime,
        eventId,
    } = req.body;

    if (!title || !eventId) {
        return sendError(res, '必須提供活動標題和用戶ID', 400);
    }

    try {
        const result = await editEvent(
            title,
            description,
            location,
            startDate,
            startTime,
            endDate,
            endTime,
            eventId
        );

        sendSuccess(res, result, '活動更新成功');
    } catch (err) {
        sendError(res, '活動更新失敗', 500, err);
    }
});

router.put(community.editEventPhoto, authenticate, async (req, res) => {
    try {
        if (!req.files || !req.body.eventId) {
            return sendError(res, '必須提供照片 and 活動ID', 400);
        }

        let photo = req.files.photo;
        let eventId = req.body.eventId;

        if (!photo) {
            return sendError(res, '未上傳照片', 400);
        }
        try {
            const photoName = photo.name;
            const imageData = photo.data;

            const result = await editEventPhoto(photoName, imageData, eventId);

            sendSuccess(res, result, '更新檔案已上傳並儲存到數據庫', {
                fileInfo: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                }
            });
        } catch (err) {
            sendError(res, 'Internal server error', 500, err);
        }
    } catch (err) {
        sendError(res, 'Server error', 500, err);
    }
});

export default router;
