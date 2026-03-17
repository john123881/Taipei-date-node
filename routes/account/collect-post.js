import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const collectPostRouter = express.Router();

// 收藏 - 貼文列表
collectPostRouter.get(account.collectPost, authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };

    try {
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const sid = parseInt(req.params.sid) || 0;
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;

        // 1. 取得總筆數
        const totalRows = await prisma.comm_saved.count({
            where: { user_id: sid }
        });

        if (totalRows === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        const totalPages = Math.ceil(totalRows / perPage);

        // 2. 處理頁碼跳轉
        if (page < 1 || (totalPages > 0 && page > totalPages)) {
            const targetPage = page < 1 ? 1 : totalPages;
            const newQuery = { ...req.query, page: targetPage };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
            return res.redirect(redirectUrl);
        }

        // 3. 取得分頁資料
        const savedPosts = await prisma.comm_saved.findMany({
            where: { user_id: sid },
            orderBy: { comm_saved_id: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                comm_post: {
                    include: {
                        member_user: { // 作者資訊
                            select: {
                                user_id: true,
                                email: true,
                                username: true,
                                avatar: true
                            }
                        },
                        comm_photo: { // 貼文照片
                            select: {
                                photo_name: true,
                                img: true
                            },
                            take: 1 // 原 SQL 只抓一張
                        }
                    }
                }
            }
        });

        // 4. 資料扁平化與格式轉換以維持相容性
        const formattedData = savedPosts.map(item => {
            const post = item.comm_post;
            const author = post?.member_user;
            const photo = post?.comm_photo?.[0];

            let imgData = null;
            if (photo?.img) {
                const imageBase64 = Buffer.from(photo.img).toString('base64');
                imgData = `data:image/jpeg;base64,${imageBase64}`;
            }

            return {
                save_id: item.comm_saved_id,
                post_id: post?.post_id,
                post_context: post?.context,
                created_at: post?.created_at,
                updated_at: post?.updated_at,
                post_userId: post?.user_id,
                author_id: author?.user_id,
                email: author?.email,
                username: author?.username,
                avatar: author?.avatar,
                photo_name: photo?.photo_name,
                img: imgData
            };
        });

        output.success = true;
        output.data = formattedData;
        output.code = 200;

        res.json({
            success: true,
            sid,
            totalRows,
            perPage,
            page,
            totalPages,
            query: req.query,
            output,
        });

    } catch (error) {
        console.error('Collect Post GET Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

// 收藏 - 刪除貼文
collectPostRouter.delete(account.collectPostDelete, authenticate, async (req, res) => {
    const output = {
        success: false,
        error: '',
        code: 0,
        data: [],
    };
    try {
        if (!req.my_jwt?.id) {
            output.success = false;
            output.code = 430;
            output.error = '沒授權';
            return res.json({ output });
        }
        const save_id = parseInt(req.params.save_id) || 0;

        // 1. 確認是否存在
        const existing = await prisma.comm_saved.findUnique({
            where: { comm_saved_id: save_id }
        });

        if (!existing) {
            output.code = 401;
            output.error = '沒這篇貼文';
            return res.json({ output });
        }

        // 2. 執行刪除
        const result = await prisma.comm_saved.delete({
            where: { comm_saved_id: save_id }
        });

        if (result) {
            output.success = true;
            output.action = 'remove';
            return res.json({ output });
        } else {
            output.code = 410;
            output.error = '無法移除';
            return res.json({ output });
        }
    } catch (error) {
        console.error('Delete Saved Post Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default collectPostRouter;
