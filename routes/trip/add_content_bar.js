import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentBar } from '../../services/index.js';

const router = express.Router();

router.post(trip.createContentBar, createContentBar);

export default router;
