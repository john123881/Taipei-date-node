import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getMovieDetail = async (movieId) => {
    const movie = await prisma.booking_movie.findUnique({
        where: {
            movie_id: Number(movieId),
        },
        select: {
            movie_id: true,
            title: true,
            poster_img: true,
            movie_description: true,
            movie_rating: true,
            movie_type_id: true,
            youtube_id: true,
            movie_img: true,
            movie_img_url: true,
        },
    });

    if (!movie) return [];

    return [{
        ...movie,
        movie_img: transformImgSource(movie, { imgKey: 'movie_img', urlKey: 'movie_img_url' }),
    }];
};
