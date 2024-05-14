import express from "express";
import { trip } from "../apiConfig.js";
import { getMyBarPhoto } from "../../services/index.js";

//用於取得bar圖片
const router = express.Router();

router.get(trip.getMyBarPhoto, getMyBarPhoto);

export default router;
