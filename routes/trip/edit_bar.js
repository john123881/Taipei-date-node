import express from 'express';
import { trip } from '../apiConfig.js';
import { editAddBar } from '../../services/index.js';
//新增酒吧

const router = express.Router();

router.post(trip.editAddBar, editAddBar);

export default router;
