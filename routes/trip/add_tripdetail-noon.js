import express from 'express';
import { trip } from '../apiConfig.js';
import { createNoContentNoon } from '../../services/index.js';

const router = express.Router();
router.post(trip.createContentNoon, createNoContentNoon);

export default router;
