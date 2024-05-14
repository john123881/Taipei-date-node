import express from 'express';
import { trip } from '../apiConfig.js';
import { deleteDetail } from '../../services/index.js';

const router = express.Router();

router.delete(trip.deleteDetail, deleteDetail);

export default router;
