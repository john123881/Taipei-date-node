import express from 'express';
import { account } from '../apiConfig.js';
import prisma from '../../utils/prisma-client.js';
import authenticate from '../../middlewares/authenticate.js';

const collectBarRouter = express.Router();

// 收藏 - 酒吧列表
collectBarRouter.get(account.collectBar, authenticate, async (req, res) => {
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
        const totalRows = await prisma.bar_saved.count({
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
        const savedBars = await prisma.bar_saved.findMany({
            where: { user_id: sid },
            orderBy: { bar_saved_id: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                member_user: {
                    select: { email: true, username: true }
                },
                bars: {
                    include: {
                        bar_area: true,
                        bar_type: true,
                        bar_pic: {
                            select: { bar_pic_name: true, bar_img: true },
                            take: 1
                        }
                    }
                }
            }
        });

        // 4. 資料轉換
        const formattedData = savedBars.map(item => {
            const bar = item.bars;
            const user = item.member_user;
            const photo = bar?.bar_pic?.[0];

            let imgData = null;
            if (photo?.bar_img) {
                const imageBase64 = Buffer.from(photo.bar_img).toString('base64');
                imgData = `data:image/jpeg;base64,${imageBase64}`;
            }

            return {
                save_id: item.bar_saved_id,
                email: user?.email,
                username: user?.username,
                bar_id: bar?.bar_id,
                bar_name: bar?.bar_name,
                area: bar?.bar_area?.bar_area_name,
                address: bar?.bar_addr,
                type: bar?.bar_type?.bar_type_name,
                contact: bar?.bar_contact,
                description: bar?.bar_description,
                img_name: photo?.bar_pic_name,
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
        console.error('Collect Bar GET Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

// 收藏 - 刪除酒吧
collectBarRouter.delete(account.collectBarDelete, authenticate, async (req, res) => {
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

        const existing = await prisma.bar_saved.findUnique({
            where: { bar_saved_id: save_id }
        });

        if (!existing) {
            output.code = 401;
            output.error = '無收藏此間酒吧';
            return res.json({ output });
        }

        const result = await prisma.bar_saved.delete({
            where: { bar_saved_id: save_id }
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
        console.error('Delete Saved Bar Error:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

export default collectBarRouter;
