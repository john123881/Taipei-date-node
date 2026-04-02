import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getIndexMovieList = async () => {
    // Prisma does not have a native order-by-rand, so we use queryRaw safely
    const results = await prisma.$queryRaw`
        SELECT 
            movie_id, title, poster_img, movie_description, movie_rating, movie_type_id, movie_img, movie_img_url
        FROM 
            booking_movie
        ORDER BY RAND()
        LIMIT 6
    `;

    return results.map((pic) => {
        return {
            ...pic,
            movie_img: transformImgSource(pic, { imgKey: 'movie_img', urlKey: 'poster_img' }),
        };
    });
};
