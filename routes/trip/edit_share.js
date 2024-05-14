import express from 'express';
import { trip } from '../apiConfig.js';
import { editShare } from '../../services/index.js';

const router = express.Router();

router.post(trip.editShare, editShare);

export default router;
