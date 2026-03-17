import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const collectListRouter = express.Router();

// Navbar收藏列表 (整合 貼文、酒吧、電影)
collectListRouter.get(account.collectList, authenticate, async (req, res) => {
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

        // 由於 Prisma 不支援 UNION，我們分別查詢後在 JS 層合併並排序
        
        // 1. 查詢收藏的貼文 (最新 10 筆)
        const savedPosts = await prisma.comm_saved.findMany({
            where: { user_id: sid },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: {
                comm_post: {
                    include: {
                        member_user: true,
                        comm_photo: { select: { img: true, photo_name: true }, take: 1 },
                        comm_likes: true // 用於計算讚數
                    }
                }
            }
        });

        // 2. 查詢收藏的酒吧 (最新 10 筆)
        const savedBars = await prisma.bar_saved.findMany({
            where: { user_id: sid },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: {
                bars: {
                    include: {
                        bar_pic: { select: { bar_img: true, bar_pic_name: true }, take: 1 }
                    }
                }
            }
        });

        // 3. 查詢收藏的電影 (最新 10 筆)
        const savedMovies = await prisma.booking_movie_saved.findMany({
            where: { user_id: sid },
            orderBy: { created_at: 'desc' },
            take: 10
        });
        
        // 電影暫時需要手動抓取詳情 (若 schema 沒關聯)
        const moviesWithDetails = [];
        for(const m of savedMovies) {
            const detail = await prisma.booking_movie.findUnique({
                where: { movie_id: m.movie_id },
                include: { booking_movie_type: true }
            });
            moviesWithDetails.push({ ...m, detail });
        }

        // 4. 對應回原本資料格式並合併
        const listItems = [
            ...savedPosts.map(p => ({
                author_id: p.comm_post?.user_id || null,
                author_email: p.comm_post?.member_user?.email || null,
                author_avatar: p.comm_post?.member_user?.avatar || null,
                user_id: p.user_id,
                username: p.comm_post?.member_user?.username || 'Unknown',
                email: p.comm_post?.member_user?.email || null,
                saved_id: p.comm_saved_id,
                item_id: p.post_id,
                created_at: p.created_at,
                img: p.comm_post?.comm_photo?.[0]?.img || null,
                img_name: p.comm_post?.comm_photo?.[0]?.photo_name || null,
                title: p.comm_post?.member_user?.username || 'Unknown',
                subtitle: p.comm_post?.comm_likes?.length || 0,
                content: p.comm_post?.context,
                rating: null,
                item_type: 'post'
            })),
            ...savedBars.map(b => ({
                author_id: null,
                author_email: null,
                author_avatar: null,
                user_id: b.user_id,
                username: null, // 原 SQL 中 users.username 代表的是收藏者的名稱
                email: null,
                saved_id: b.bar_saved_id,
                item_id: b.bar_id,
                created_at: b.created_at,
                img: b.bars?.bar_pic?.[0]?.bar_img || null,
                img_name: b.bars?.bar_pic?.[0]?.bar_pic_name || null,
                title: b.bars?.bar_name,
                subtitle: b.bars?.bar_addr,
                content: b.bars?.bar_description,
                rating: null,
                item_type: 'bar'
            })),
            ...moviesWithDetails.map(m => ({
                author_id: null,
                author_email: null,
                author_avatar: null,
                user_id: m.user_id,
                username: null,
                email: null,
                saved_id: m.booking_movie_saved_id,
                item_id: m.movie_id,
                created_at: m.created_at,
                img: m.detail?.movie_img || null,
                img_name: m.detail?.poster_img || null,
                title: m.detail?.title,
                subtitle: m.detail?.booking_movie_type?.movie_type,
                content: m.detail?.movie_description,
                rating: m.detail?.movie_rating,
                item_type: 'movie'
            }))
        ];

        // 5. 排序、圖片轉檔、過濾
        const sortedList = listItems
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .map(item => {
                if (item.img) {
                    const imageBase64 = Buffer.from(item.img).toString('base64');
                    return {
                        ...item,
                        img: `data:image/jpeg;base64,${imageBase64}`,
                    };
                }
                return item;
            });

        output.success = true;
        output.data = sortedList;
        output.code = 200;

        res.json({
            success: true,
            sid,
            query: req.query,
            output,
        });

    } catch (error) {
        console.error('Collect List Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default collectListRouter;
