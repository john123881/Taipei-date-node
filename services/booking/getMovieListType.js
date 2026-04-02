import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getMovieListType = async (movie_type_id) => {
    const results = await prisma.booking_movie.findMany({
        where: {
            movie_type_id: movie_type_id ? Number(movie_type_id) : undefined,
        },
        select: {
            movie_id: true,
            title: true,
            poster_img: true,
            movie_description: true,
            movie_rating: true,
            movie_type_id: true,
            movie_img: true,
            movie_img_url: true,
        },
    });

    return results.map((pic) => {
        return {
            ...pic,
            movie_img: transformImgSource(pic, { imgKey: 'movie_img', urlKey: 'poster_img' }),
        };
    });
};
