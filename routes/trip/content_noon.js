import express from "express";
import { trip } from "../apiConfig.js";
import { getContentNoon } from "../../services/index.js";

const router = express.Router();
router.get(trip.getContentNoon, getContentNoon);

export default router;
