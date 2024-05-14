import express from 'express';
import { trip } from '../apiConfig.js';
import { createNoContentNight } from '../../services/index.js';

const router = express.Router();
router.post(trip.createContentNight, createNoContentNight);

export default router;
