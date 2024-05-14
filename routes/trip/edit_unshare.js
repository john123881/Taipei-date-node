import express from 'express';
import { trip } from '../apiConfig.js';
import { editUnshare } from '../../services/index.js';

const router = express.Router();
router.post(trip.editUnshare, editUnshare);

export default router;
