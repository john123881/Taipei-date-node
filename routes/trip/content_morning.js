import express from "express";
import { trip } from "../apiConfig.js";
import { getContentMorning } from "../../services/trip/getContentMorning.js";

const router = express.Router();
router.get(trip.getContentMorning, getContentMorning);

export default router;
