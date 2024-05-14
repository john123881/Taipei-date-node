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

const router = express.Router();

// 啟動檔案上傳
router.use(
    fileUpload({
        createParentPath: true,
    })
);

router.post(community.createPost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { context, userId } = req.body;

    // 檢查 context 和 userId 是否存在
    if (!context || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文內容和用戶ID',
        });
    }

    try {
        const newPost = await createPost(context, userId);
        res.status(201).json({
            status: true,
            message: '貼文新增成功',
            post: newPost,
        });
    } catch (err) {
        console.error('新增貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '貼文新增失敗',
            error: err.message,
        });
    }
});

router.post(community.uploadPhoto, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    try {
        if (!req.files || !req.body.postId) {
            return res.status(400).send({
                status: false,
                message: '必須提供照片和貼文ID',
            });
        }

        // 使用輸入框的名稱來獲取上傳檔案 (例如 "photo")
        let photo = req.files.photo;
        let postId = req.body.postId; // 從請求中獲取 postId

        // 檢查 photo 是否存在
        if (!photo) {
            return res.status(400).send({
                status: false,
                message: '未上傳照片',
            });
        }

        try {
            // 讀取文件內容
            const photoName = photo.name;
            const imageData = photo.data;

            // 模擬將文件信息和內容儲存到數據庫中的函數（需自行實現該函數）
            const result = await uploadPhoto(photoName, postId, imageData);

            res.json({
                status: true,
                message: '檔案已上傳並儲存到數據庫',
                data: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                },
                post: result,
            });
        } catch (err) {
            console.error('檔案上傳到數據庫過程中出錯:', err);
            res.status(500).json({
                status: false,
                message: 'Server error',
                error: err.message,
            });
        }
    } catch (err) {
        console.error('處理請求過程中出錯:', err);
        res.status(500).json({
            status: false,
            message: 'Server error',
            error: err.message,
        });
    }
});

router.post(community.createEvent, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

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

    // 檢查活動細節是否存在
    if (
        !title ||
        !description ||
        !status ||
        !location ||
        !userId ||
        !startDate ||
        !startTime ||
        !endDate ||
        !endTime
    ) {
        return res.status(400).json({
            status: false,
            message: '必須提供活動內容',
        });
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
        res.status(201).json({
            status: true,
            message: '活動新增成功',
            event: newEvent,
        });
    } catch (err) {
        console.error('新增貼文錯誤:', err);
        res.status(500).json({
            status: false,
            message: '活動新增失敗',
            error: err.message,
        });
    }
});

router.post(community.uploadEventPhoto, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    try {
        // console.log(req.files);
        if (!req.files || !req.body.eventId) {
            return res.status(400).send({
                status: false,
                message: '必須提供照片和活動ID',
            });
        }

        // 使用輸入框的名稱來獲取上傳檔案 (例如 "photo")
        let photo = req.files.photo;
        let eventId = req.body.eventId; // 從請求中獲取 eventId

        // 檢查 photo 是否存在
        if (!photo) {
            return res.status(400).send({
                status: false,
                message: '未上傳照片',
            });
        }

        try {
            // 讀取文件內容
            const photoName = photo.name;
            const imageData = photo.data;

            // 模擬將文件信息和內容儲存到數據庫中的函數（需自行實現該函數）
            const result = await uploadEventPhoto(
                photoName,
                eventId,
                imageData
            );

            res.json({
                status: true,
                message: '檔案已上傳並儲存到數據庫',
                data: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                },
                event: result,
            });
        } catch (err) {
            console.error('檔案上傳到數據庫過程中出錯:', err);
            res.status(500).json({
                status: false,
                message: 'Server error',
                error: err.message,
            });
        }
    } catch (err) {
        console.error('處理請求過程中出錯:', err);
        res.status(500).json({
            status: false,
            message: 'Server error',
            error: err.message,
        });
    }
});

router.post(community.addComment, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { context, status, postId, userId } = req.body;

    // 檢查 context, status, postId, 和 userId 是否存在
    if (!context || !status || !postId || !userId) {
        return res.status(400).json({
            status: false,
            message: '必須提供回覆內容, status, postID, 和 userID',
        });
    }

    try {
        const result = await addComment(context, status, postId, userId);
        res.status(201).json({
            status: true,
            message: '回覆新增成功',
            commentId: result.insertId,
            email: result.email,
            context: context,
        });
    } catch (err) {
        console.error('新增回覆錯誤:', err);
        res.status(500).json({
            status: false,
            message: '回覆新增失敗',
            error: err.message,
        });
    }
});

router.put(community.editPost, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { context, postId } = req.body;

    // 檢查 context 和 userId 是否存在
    if (!context || !postId) {
        return res.status(400).json({
            status: false,
            message: '必須提供貼文內容和用戶ID',
        });
    }

    try {
        const result = await editPost(context, postId);

        res.status(200).json({
            status: true,
            message: '貼文更新成功',
            post: result,
        });
    } catch (err) {
        console.error('貼文更新錯誤:', err);
        res.status(500).json({
            status: false,
            message: '貼文更新失敗',
            error: err.message,
        });
    }
});

router.put(community.editPostPhoto, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    try {
        // console.log('Files:', req.files);
        // console.log('Body:', req.body);
        if (!req.files || !req.body.postId) {
            return res.status(400).send({
                status: false,
                message: '必須提供照片和貼文ID',
            });
        }

        // 使用輸入框的名稱來獲取上傳檔案 (例如 "photo")
        let photo = req.files.photo;
        let postId = req.body.postId; // 從請求中獲取 postId

        // 檢查 photo 是否存在
        if (!photo) {
            return res.status(400).send({
                status: false,
                message: '未上傳照片',
            });
        }
        try {
            // 讀取文件內容
            const photoName = photo.name;
            const imageData = photo.data;

            // 模擬將文件信息和內容儲存到數據庫中的函數（需自行實現該函數）
            const result = await editPostPhoto(photoName, imageData, postId);

            res.json({
                status: true,
                message: '更新檔案已上傳並儲存到數據庫',
                data: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                },
                post: result,
            });
        } catch (err) {
            // console.log('result', result);
            console.error('更新檔案上傳到數據庫過程中出錯:', err);
            res.status(500).json({
                status: false,
                message: 'Server error',
                error: err.message,
            });
        }
    } catch (err) {
        console.error('處理請求過程中出錯:', err);
        res.status(500).json({
            status: false,
            message: 'Server error',
            error: err.message,
        });
    }
});

router.put(community.editEvent, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

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

    // console.log('Received body:', req.body);

    // 檢查活動細節是否存在
    if (
        !title ||
        !description ||
        !location ||
        !startDate ||
        !startTime ||
        !endDate ||
        !endTime ||
        !eventId
    ) {
        return res.status(400).json({
            status: false,
            message: '必須提供活動內容',
        });
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

        res.status(200).json({
            status: true,
            message: '活動更新成功',
            event: result,
        });
    } catch (err) {
        console.error('活動更新錯誤:', err);
        res.status(500).json({
            status: false,
            message: '活動更新失敗',
            error: err.message,
        });
    }
});

router.put(community.editEventPhoto, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    try {
        if (!req.files || !req.body.eventId) {
            return res.status(400).send({
                status: false,
                message: '必須提供照片和活動ID',
            });
        }

        // 使用輸入框的名稱來獲取上傳檔案 (例如 "photo")
        let photo = req.files.photo;
        let eventId = req.body.eventId; // 從請求中獲取 postId

        // 檢查 photo 是否存在
        if (!photo) {
            return res.status(400).send({
                status: false,
                message: '未上傳照片',
            });
        }
        try {
            // 讀取文件內容
            const photoName = photo.name;
            const imageData = photo.data;

            // 模擬將文件信息和內容儲存到數據庫中的函數（需自行實現該函數）
            const result = await editEventPhoto(photoName, imageData, eventId);

            res.json({
                status: true,
                message: '更新檔案已上傳並儲存到數據庫',
                data: {
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size,
                },
                event: result,
            });
        } catch (err) {
            // console.log('result', result);
            console.error('更新檔案上傳到數據庫過程中出錯:', err);
            res.status(500).json({
                status: false,
                message: 'Server error',
                error: err.message,
            });
        }
    } catch (err) {
        // console.error('處理請求過程中出錯:', err);
        res.status(500).json({
            status: false,
            message: 'Server error',
            error: err.message,
        });
    }
});

export default router;
