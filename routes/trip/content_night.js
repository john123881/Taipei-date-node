import express from "express";
import { trip } from "../apiConfig.js";
import { getContentNight } from "../../services/index.js";

const router = express.Router();
router.get(trip.getContentNight, getContentNight);

export default router;
