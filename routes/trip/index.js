import tripPlansRouter from './trip_plans.js';
import myDetailsRouter from './my_details.js';
import otherTripRouter from './other_plans.js';
import contentMorningRouter from './content_morning.js';
import contentNoonRouter from './content_noon.js';
import contentNightRouter from './content_night.js';
import contentAllDayRouter from './content_allday.js';
import myBarPhotoRouter from './my_barPhoto.js';
import myMoviePhotoRouter from './my_moviePhoto.js';
import barNameRouter from './my_barName.js';
import editShareRouter from './edit_share.js';
import editUnshareRouter from './edit_unshare.js';
import addMorningRouter from './add_tripdetail-morning.js';
import addNoonRouter from './add_tripdetail-noon.js';
import addNightRouter from './add_tripdetail-night.js';
import getBarSavedRouter from './bar_saved.js';
import getMovieRouter from './movie.js';
import getMovieWithIdRouter from './movieWithId.js';
import editAddBarRouter from './edit_bar.js';
import editAddMovieRouter from './edit_movie.js';
import deleteDetailRouter from './delete_detail.js';
import uploadTripPhotoRouter from './upload_photo.js';
import editDnNRouter from './edit_DnN.js';
import addContentBarRouter from './add_content_bar.js';
import addContentMovieRouter from './add_content_movie.js';
//將他人行程加入月曆
import addOtherContentRouter from './add_otherTrip.js';

const tripRouter = {
    tripPlansRouter,
    myDetailsRouter,
    otherTripRouter,
    contentMorningRouter,
    contentNoonRouter,
    contentNightRouter,
    contentAllDayRouter,
    myBarPhotoRouter,
    myMoviePhotoRouter,
    barNameRouter,
    editShareRouter,
    editUnshareRouter,
    addMorningRouter,
    getBarSavedRouter,
    getMovieRouter,
    editAddBarRouter,
    editAddMovieRouter,
    addNoonRouter,
    addNightRouter,
    deleteDetailRouter,
    getMovieWithIdRouter,
    uploadTripPhotoRouter,
    editDnNRouter,
    addContentBarRouter,
    addOtherContentRouter,
    addContentMovieRouter,
};

export default tripRouter;
