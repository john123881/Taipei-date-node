import express from 'express';
import movieListrouter from './movie-list.js';
import movieListTypeRouter from './movie-type.js';

const bookingRouter = express.Router();

bookingRouter.use('/', 
    movieListrouter,
    movieListTypeRouter
);

export default bookingRouter;
