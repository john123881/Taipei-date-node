import express from 'express';
import { trip } from '../apiConfig.js';
import { getMovieWithId } from '../../services/index.js';

const router = express.Router();

router.get(trip.getMovieWithId, getMovieWithId);

export default router;
