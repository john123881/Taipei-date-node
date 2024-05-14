import express from 'express';
import { trip } from '../apiConfig.js';
import { getAllDayContent } from '../../services/index.js';

const router = express.Router();

router.get(trip.getAllDayContent, getAllDayContent);

export default router;
