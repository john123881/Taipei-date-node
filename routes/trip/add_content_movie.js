import express from 'express';
import { trip } from '../apiConfig.js';
import { createContentMovie } from '../../services/index.js';

const router = express.Router();

router.post(trip.createContentMovie, createContentMovie);

export default router;
