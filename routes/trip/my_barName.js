import express from "express";
import { trip } from "../apiConfig.js";
import { getBarNameForPhoto } from "../../services/index.js";

//用於取的電影照片所需要的名稱
const router = express.Router();
//trip.-->後面要接 apiConfig 中定義的路由
router.get(trip.getMyBarNameForPhoto, getBarNameForPhoto);

export default router;
