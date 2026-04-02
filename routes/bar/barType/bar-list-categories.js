import express from 'express';
import { bar } from '../../apiConfig.js';
import { getFilteredBarList } from '../../../services/index.js';
import { sendSuccess, sendError } from '../../../utils/response-handler.js';
import catchAsync from '../../../utils/catch-async.js';

const barListCategoriesRouter = express.Router();

/**
 * 建立類別路由處理函數的工廠函數
 * @param {number} defaultTypeId - 該路由預設的酒吧類型 ID
 * @returns {Function} Express 路由處理函數
 */
const createCategoryHandler = (defaultTypeId) => catchAsync(async (req, res) => {
    try {
        const { area, type } = req.query;
        const results = await getFilteredBarList({ 
            bar_type_id: type || defaultTypeId, 
            bar_area_id: area 
        });
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});

// 註冊所有類別路由
barListCategoriesRouter.get(bar.getBarListSport, createCategoryHandler(1));
barListCategoriesRouter.get(bar.getBarListMusic, createCategoryHandler(2));
barListCategoriesRouter.get(bar.getBarListForeign, createCategoryHandler(3));
barListCategoriesRouter.get(bar.getBarListSpecialty, createCategoryHandler(4));
barListCategoriesRouter.get(bar.getBarListOthers, createCategoryHandler(5));

export default barListCategoriesRouter;
