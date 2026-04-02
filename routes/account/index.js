import express from 'express';
import addDataRouter from './add-data.js';
import profileRouter from './profile.js';
import editProfileRouter from './edit-profile.js';
import uploadAvatarRouter from './upload-avatar.js';
import changePasswordRouter from './change-password.js';
import gameRecordRouter from './game-record.js';
import recordPointRouter from './record-point.js';
import recordGameRouter from './record-game.js';
import collectionsRouter from './collections.js';
import collectListRouter from './collect-list.js';

const accountRouter = express.Router();

accountRouter.use('/', 
    addDataRouter,
    profileRouter,
    editProfileRouter,
    uploadAvatarRouter,
    changePasswordRouter,
    gameRecordRouter,
    recordPointRouter,
    recordGameRouter,
    collectionsRouter,
    collectListRouter
);

export default accountRouter;
