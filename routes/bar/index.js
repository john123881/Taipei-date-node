// bar list
import barListRouter from './bar-list.js';
import barListTypeRouter from './bar-list-type.js';
import barListAreaRouter from './bar-list-area.js';
import barListRadomRouter from './bar-list-radom.js';

import barListAuthRouter from './bar-list(add-auth).js';
import barListSportRouter from './barType/bar-list-sport.js';
import barListMusicRouter from './barType/bar-list-music.js';
import barListForeignRouter from './barType/bar-list-foreign.js';
import barListSpecialtyRouter from './barType/bar-list-specialty.js';
import barListOthersRouter from './barType/bar-list-others.js';

import barTypeRouter from './bar-type.js';
import barAreaRouter from './bar-area.js';
import barDetailRouter from './bar-detail.js';
import barRatingRouter from './bar-rating.js';
import barRatingAverageRouter from './bar-rating-average.js';
import barBookingListRouter from './bar-booking-list.js';
import barBookingRouter from './bar-booking.js';
import barSavedRouter from './bar-saved.js';
import barSearchRouter from './bar-search.js';

const barRouter = {
    // bar list
    barListRouter,
    barListTypeRouter,
    barListAreaRouter,
    barListRadomRouter,
    barListAuthRouter,
    barListSportRouter,
    barListMusicRouter,
    barListForeignRouter,
    barListSpecialtyRouter,
    barListOthersRouter,

    barTypeRouter,
    barAreaRouter,
    barDetailRouter,
    barRatingRouter,
    barRatingAverageRouter,
    barBookingListRouter,
    barBookingRouter,

    barSavedRouter,
    barSearchRouter,
};

export default barRouter;
