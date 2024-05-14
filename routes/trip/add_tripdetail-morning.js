import express from 'express';
import { trip } from '../apiConfig.js';
import { createNoContentMorning } from '../../services/index.js';

const router = express.Router();
router.post(trip.createContentMorning, createNoContentMorning);

export default router;
