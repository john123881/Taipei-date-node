import express from 'express';
import { bar } from '../apiConfig.js';
import {
    getBarListType,
    // getBarListDynamicById,
} from '../../services/index.js';
// import db from '../../utils/mysql2-connect.js';

const barListTypeRouter = express.Router();

barListTypeRouter.get(bar.getBarListType, async (req, res) => {
    const { bar_type_id } = req.params;
    //   const results = await getBarDetail();
    const results = await getBarListType(bar_type_id);
    res.json(results);
});

barListTypeRouter.get(bar.getBarListType, async (_req, res) => {
    const results = await getBarListType();
    res.json(results);
});

export default barListTypeRouter;
