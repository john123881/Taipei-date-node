import express from "express";
import { bar } from "../apiConfig.js";
import { getBarDetail, getBarDetailById } from "../../services/index.js";
// import { getBarDetailById } from "../../services/bar/getBarDetailById.js";


const barDetailRouter = express.Router();

barDetailRouter.get(bar.getBarDetail, async (req, res) => {
    try {
        const { bar_id } = req.params;
        const results = await getBarDetailById(bar_id);
        res.json(results);
    } catch (error) {
        console.error('getBarDetailById error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

barDetailRouter.get('/bar-detail', async (req, res) => {
    try {
        const results = await getBarDetail();
        res.json(results);
    } catch (error) {
        console.error('getBarDetail error:', error);
        res.status(500).json({ status: false, message: '伺服器錯誤', error: error.message });
    }
});

export default barDetailRouter;
