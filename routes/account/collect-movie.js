import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const collectMovieRouter = express.Router();

// 收藏 - 電影列表
collectMovieRouter.get(account.collectMovie, authenticate, async (req, res) => {
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
        const totalRows = await prisma.booking_movie_saved.count({
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

        // 3. 取得分頁資料 (手動處理 model 關聯，因為 schema 沒有自動偵測到 movie_saved -> booking_movie)
        // 注意: 原 SQL 使用了 JOIN booking_movie，但 schema.prisma 中 booking_movie_saved 
        // 並沒有定義關聯。我們可以直接查詢 movie 詳情，或是在 JS 層處理。
        // 現在我會先去檢查 schema 到底有沒有這個關聯
        const savedMovies = await prisma.booking_movie_saved.findMany({
            where: { user_id: sid },
            orderBy: { booking_movie_saved_id: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage
        });

        // 4. 手動獲取關聯資料 (由於 schema 缺少 Relation)
        const formattedData = [];
        for (const item of savedMovies) {
            const movie = await prisma.booking_movie.findUnique({
                where: { movie_id: item.movie_id },
                include: { booking_movie_type: true }
            });
            const user = await prisma.member_user.findUnique({
                where: { user_id: item.user_id },
                select: { email: true, username: true }
            });

            let imgData = null;
            if (movie?.movie_img) {
                const imageBase64 = Buffer.from(movie.movie_img).toString('base64');
                imgData = `data:image/jpeg;base64,${imageBase64}`;
            }

            formattedData.push({
                save_id: item.booking_movie_saved_id,
                email: user?.email,
                username: user?.username,
                title: movie?.title,
                movie_id: movie?.movie_id,
                description: movie?.movie_description,
                rating: movie?.movie_rating,
                img_name: movie?.poster_img,
                img: imgData,
                type: movie?.booking_movie_type?.movie_type
            });
        }

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
        console.error('Collect Movie GET Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

// 收藏 - 刪除電影
collectMovieRouter.delete(account.collectMovieDelete, authenticate, async (req, res) => {
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

        const existing = await prisma.booking_movie_saved.findUnique({
            where: { booking_movie_saved_id: save_id }
        });

        if (!existing) {
            output.code = 401;
            output.error = '無收藏此部電影';
            return res.json({ output });
        }

        const result = await prisma.booking_movie_saved.delete({
            where: { booking_movie_saved_id: save_id }
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
        console.error('Delete Saved Movie Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default collectMovieRouter;
