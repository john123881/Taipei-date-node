import express from 'express';
import { trip } from '../apiConfig.js';
import { getMovie } from '../../services/index.js';

const router = express.Router();

router.get(trip.getMovie, getMovie);

export default router;
