import express from 'express';
import { trip } from '../apiConfig.js';
import { editDnN } from '../../services/index.js';

const router = express.Router();

router.post(trip.editDnN, editDnN);

export default router;
