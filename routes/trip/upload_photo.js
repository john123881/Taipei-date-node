import express from 'express';
import { trip } from '../apiConfig.js';
import { uploadTripPhoto } from '../../services/index.js';
import coverUpload from '../../utils/upload-cover.js';

const router = express.Router();

router.post(
    trip.uploadTripPhoto,
    coverUpload.single('tripPic'),
    uploadTripPhoto
);

export default router;
