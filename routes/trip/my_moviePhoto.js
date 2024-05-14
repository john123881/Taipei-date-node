import express from "express";
import { trip } from "../apiConfig.js";
import { getMyMoviePhoto } from "../../services/index.js";

//用於取得movie圖片
const router = express.Router();
// 使用 apiConfig 中定義的路由
router.get(trip.getMyMoviePhoto, getMyMoviePhoto);

export default router;
