import express from 'express';
import { bar } from '../apiConfig.js';
import * as services from '../../services/index.js';
import { sendSuccess } from '../../utils/response-handler.js';
import catchAsync from '../../utils/catch-async.js';

const barListFiltersRouter = express.Router();

/**
 * 建立酒吧過濾處理函數的工廠函數
 * @param {string} paramName - URL 參數名稱 (如 'bar_area_id')
 * @param {string} serviceName - 服務函數名稱 (如 'getBarListArea')
 */
const createFilterHandler = (paramName, serviceName) => catchAsync(async (req, res) => {
    const paramValue = req.params[paramName];
    const results = await services[serviceName](paramValue);
    sendSuccess(res, results);
});

// 區域過濾
barListFiltersRouter.get(bar.getBarListArea, createFilterHandler('bar_area_id', 'getBarListArea'));

// 類型過濾
barListFiltersRouter.get(bar.getBarListType, createFilterHandler('bar_type_id', 'getBarListType'));

export default barListFiltersRouter;
