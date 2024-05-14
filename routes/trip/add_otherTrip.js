import express from 'express';
import { trip } from '../apiConfig.js';
import { createOtherContent } from '../../services/index.js';

const router = express.Router();
router.post(trip.createOtherContent, createOtherContent);

export default router;
