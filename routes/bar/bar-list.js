import express from 'express';
import { bar } from '../apiConfig.js';
import { getBarList, getBarListId, getFilteredBarList } from '../../services/index.js';
import { sendSuccess } from '../../utils/response-handler.js';
import catchAsync from '../../utils/catch-async.js';

const barListRouter = express.Router();

barListRouter.get(bar.getBarList, catchAsync(async (_req, res) => {
    const results = await getBarList();
    sendSuccess(res, results);
}));

barListRouter.get('/bar/bar-list', catchAsync(async (req, res) => {
    const { bar_area_id, bar_type_id } = req.query;
    const results = await getFilteredBarList({ bar_area_id, bar_type_id });
    sendSuccess(res, results);
}));

barListRouter.get(bar.getBarListId, catchAsync(async (req, res) => {
    const { bar_id } = req.params;
    const results = await getBarListId(bar_id);
    sendSuccess(res, results);
}));

export default barListRouter;
