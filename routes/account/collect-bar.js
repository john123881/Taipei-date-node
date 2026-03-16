import express from 'express';
import { account } from '../apiConfig.js';
import db from '../../utils/mysql2-connect.js';
import authenticate from '../../middlewares/authenticate.js';

const collectBarRouter = express.Router();

//收藏 - 酒吧列表
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

        //判斷頁面是否低於第一頁，有的話跳回第一頁
        if (page < 1) {
            const newQuery = { ...req.query, page: 1 };
            const qp = new URLSearchParams(newQuery).toString();
            const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
            return res.redirect(redirectUrl);
        }
        const perPage = 5;
        //當每頁10個，判斷總筆數
        const total_sql_point = `SELECT COUNT(1) totalRows FROM bar_saved WHERE user_id = ${sid}`;
        const [[{ totalRows }]] = await db.query(total_sql_point);

        let rows = [];
        let totalPages = 0;

        if (totalRows > 0) {
            totalPages = Math.ceil(totalRows / perPage);

            if (page > totalPages) {
                const newQuery = { ...req.query, page: totalPages };
                const qp = new URLSearchParams(newQuery).toString();
                const redirectUrl = `${req.originalUrl.split('?')[0]}?${qp}`;
                return res.redirect(redirectUrl);
            }
            console.log('總頁數為:', totalPages);

            //放入SQL
            const query = `
                        SELECT
                            save.bar_saved_id AS save_id,
                            users.email,
                            users.username,
                            bars.bar_id, 
                            bars.bar_name,
                            area.bar_area_name AS area,
                            bars.bar_addr AS address,
                            type.bar_type_name AS type,
                            bars.bar_contact AS contact,
                            bars.bar_description AS description,
                            photos.bar_pic_name AS img_name,
                            photos.bar_img AS img
                        FROM 
                        bar_saved AS save
                        LEFT JOIN     
                            bars
                        ON 
                            save.bar_id = bars.bar_id
                        LEFT JOIN 
                            member_user AS users 
                        ON 
                            save.user_id = users.user_id
                        LEFT JOIN 
                            bar_pic AS photos 
                        ON 
                            bars.bar_id = photos.bar_id
                        LEFT JOIN 
                            bar_area AS area 
                        ON 
                            bars.bar_area_id = area.bar_area_id
                        LEFT JOIN 
                            bar_type AS type 
                        ON 
                            bars.bar_type_id = type.bar_type_id
                        WHERE 
                            save.user_id = ${sid}
                        ORDER BY 
                            save.bar_saved_id DESC
                        LIMIT ${(page - 1) * perPage} , ${perPage}`;
            [rows] = await db.query(query);
        }

        //沒筆數的話 輸出error 無相關紀錄
        if (rows.length === 0) {
            output.code = 440;
            output.error = '無收藏';
            output.data = [];
            return res.json({ success: false, output });
        }

        //把圖片轉檔
        const bars = rows.map((bar) => {
            if (bar.img) {
                const imageBase64 = Buffer.from(bar.img).toString('base64');
                return {
                    ...bar,
                    img: `data:image/jpeg;base64,${imageBase64}`,
                };
            }
            return bar;
        });

        output.success = true;
        output.data = bars;
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
        console.error('Error in /record-point/:sid:', error);
        output.success = false;
        output.code = 500;
        output.error = '伺服器錯誤';
        res.status(500).json({ success: false, output });
    }
});

//收藏 - 刪除酒吧
collectBarRouter.delete(
    account.collectBarDelete,
    authenticate,
    async (req, res) => {
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
            let save_id = req.params.save_id;
            // 1.先確認有無此save_id的存在
            const sql1 = 'SELECT * FROM bar_saved WHERE bar_saved_id=? ';
            const [rows1] = await db.query(sql1, [save_id]);
            //沒這個save_id return
            if (!rows1.length) {
                output.code = 401;
                output.error = '無收藏此間酒吧';
                return res.json({ output });
            }
            const sql2 = ` DELETE FROM bar_saved WHERE bar_saved_id=? `;
            const [result] = await db.query(sql2, [save_id]);
            //看看有無移除成功
            if (result.affectedRows) {
                output.success = true;
                output.action = 'remove';
                return res.json({ output });
            } else {
                //沒移除成功
                output.code = 410;
                output.error = '無法移除';
                return res.json({ output });
            }
        } catch (error) {
            console.error('Error in deleting post', error);
            output.success = false;
            output.code = 500;
            output.error = '伺服器錯誤';
            res.status(500).json({ success: false, output });
        }
    }
);

export default collectBarRouter;
