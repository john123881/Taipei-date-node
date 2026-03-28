import express from 'express';
import eventsRouter from './events.js';
import postRouter from './home.js';
import profileRouter from './profile.js';
import createRouter from './create.js';
import exploreRouter from './explore.js';
import searchRouter from './search.js';
import postPageRouter from './post.js';

const communityRouter = express.Router();

communityRouter.use('/', 
    eventsRouter,
    postRouter,
    profileRouter,
    createRouter,
    exploreRouter,
    searchRouter,
    postPageRouter
);

export default communityRouter;
