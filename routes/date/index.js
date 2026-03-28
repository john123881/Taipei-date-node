import express from 'express';
import barTypeRouter from './bar_type.js';
import bookingMovieTypeRouter from './booking_movie_type.js';
import friendListRouter from './friends-list.js';
import friendshipsMessageRouter from './friendships_message.js';
import userInterestRouter from './user_interest.js';

const dateRouter = express.Router();

dateRouter.use('/', 
    barTypeRouter,
    bookingMovieTypeRouter,
    friendListRouter,
    friendshipsMessageRouter,
    userInterestRouter
);

export default dateRouter;
