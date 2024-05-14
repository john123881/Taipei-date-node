import express from "express";
import { trip } from "../apiConfig.js";
import { getMyDetail } from "../../services/trip/index.js";
import { getMyTripName } from "../../services/trip/index.js";

const router = express.Router();

// 使用 apiConfig 中定義的路由
router.get(trip.getMyDetail, getMyDetail);
router.get(trip.getMyTripName, getMyTripName);

export default router;
