import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarList, getBarListId, getFilteredBarList } from '../../services/index.js';
import { sendSuccess } from '../../utils/response-handler.js';
import catchAsync from '../../utils/catch-async.js';

const barListRouter = express.Router();

// 統一處理酒吧列表 (支援篩選與搜尋)
barListRouter.get('/bar-list', catchAsync(async (req, res) => {
    const { bar_area_id, bar_type_id, searchTerm } = req.query;
    
    // 統一調用 getFilteredBarList，由該 service 處理所有篩選邏輯
    const results = await getFilteredBarList({ 
        bar_area_id, 
        bar_type_id, 
        searchTerm 
    });
    sendSuccess(res, results);
}));

barListRouter.get(bar.getBarListId, catchAsync(async (req, res) => {
    const { bar_id } = req.params;
    const results = await getBarListId(bar_id);
    sendSuccess(res, results);
}));

export default barListRouter;
