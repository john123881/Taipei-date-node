import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarList } from '../../services/index.js';
import authenticate from '../../middlewares/authenticate.js';
import { sendSuccess, sendError } from '../../utils/response-handler.js';

const barListAuthRouter = express.Router();

barListAuthRouter.get(bar.getBarList, authenticate, async (req, res) => {
    if (!req.my_jwt?.id) {
        return sendError(res, '沒授權TOKEN', 401);
    }
    try {
        const results = await getBarList();
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});
// filter: query string use effect

// barListRouter.get('/bar/bar-list', authenticate, async (req, res) => {
//     console.log('2', req.my_jwt);

//     const areaId = req.query.area; // 获取查询参数
//     let sql = 'SELECT * FROM bars';
//     const params = [];

//     if (areaId) {
//         sql += ' WHERE bar_area_id = ?'; // 根据地区ID过滤
//         params.push(areaId);
//     }

//     try {
//         const [results] = await db.query(sql, params); // 执行SQL查询
//         res.json(results); // 返回结果
//     } catch (error) {
//         console.error('Failed to fetch bars:', error);
//         res.status(500).send('Server error');
//     }
// });

export default barListAuthRouter;
