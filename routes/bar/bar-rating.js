import express from "express";
import { bar } from "../apiConfig.js";
import { getBarRating, getBarRatingById, createBarRating } from "../../services/index.js";
import authenticate from '../../middlewares/authenticate.js';

const barRatingRouter = express.Router();

barRatingRouter.get(bar.getBarRating, async (req, res) => {
  const { bar_id } = req.params;
  const results = await getBarRatingById(bar_id);
  res.json(results);
})

barRatingRouter.get("/bar-rating", async (req, res) => {
  try {
    const results = await getBarRating();
    res.json(results);
  } catch (error) {
    console.error("Error fetching all bar ratings:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 取得指定酒吧的評分
barRatingRouter.get('/bar-rating/:bar_id', async (req, res) => {
    try {
        const barId = req.params.bar_id;
        const result = await getBarRating(barId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 取得所有酒吧的评分信息
barRatingRouter.get('/bar-ratings', async (req, res) => {
    try {
        const result = await getBarRating();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// 新增評分
barRatingRouter.post(bar.createBarRating, authenticate, async (req, res) => {
    // authenticate : 授權後，!req.my_jwt?.id判斷有無授權成功

    const { bar_id, bar_rating_star, user_id } = req.body;

    // 檢查 context 和 userId 是否存在
    if (!bar_id || !bar_rating_star || !user_id) {
        return res.status(400).json({
            status: false,
            message: '必須提供酒吧評分和用戶ID',
        });
    }

    try {
        const newRating = await createBarRating(
            bar_id,
            bar_rating_star,
            user_id
        );
        res.status(201).json({
            status: true,
            message: '評分新增成功',
            rating: newRating,
        });
    } catch (err) {
        console.error('新增評分錯誤:', err);
        res.status(500).json({
            status: false,
            message: '評分新增失敗',
            error: err.message,
        });
    }
});

export default barRatingRouter;