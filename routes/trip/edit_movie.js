import express from 'express';
import { trip } from '../apiConfig.js';
import { editAddMovie } from '../../services/index.js';
//新增電影

const router = express.Router();

router.post(trip.editAddMovie, editAddMovie);

export default router;
