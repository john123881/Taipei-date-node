import express from 'express';
import { trip } from '../apiConfig.js';
import { getBarSaved } from '../../services/index.js';

const router = express.Router();

router.get(trip.getBarSaved, getBarSaved);

export default router;
