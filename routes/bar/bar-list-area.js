import express from 'express';
import { bar } from '../apiConfig.js';
import {
    getBarListArea,
    // getBarListDynamicById,
} from '../../services/index.js';
// import db from '../../utils/mysql2-connect.js';

const barListAreaRouter = express.Router();

barListAreaRouter.get(bar.getBarListArea, async (req, res) => {
    const { bar_area_id } = req.params;
    //   const results = await getBarDetail();
    const results = await getBarListArea(bar_area_id);
    res.json(results);
});

barListAreaRouter.get(bar.getBarListType, async (_req, res) => {
    const results = await getBarListArea();
    res.json(results);
});


export default barListAreaRouter;
