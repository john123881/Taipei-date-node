import express from 'express';
import { bar } from '../../apiConfig.js';
import { getFilteredBarList } from '../../../services/index.js';
import { sendSuccess, sendError } from '../../../utils/response-handler.js';

const barListOthersRouter = express.Router();

// Other bars
barListOthersRouter.get(bar.getBarListOthers, async (req, res) => {
    try {
        const { area } = req.query;
        const results = await getFilteredBarList({ 
            bar_type_id: 5, 
            bar_area_id: area 
        });
        sendSuccess(res, results);
    } catch (error) {
        sendError(res, '伺服器錯誤', 500, error);
    }
});


export default barListOthersRouter;
