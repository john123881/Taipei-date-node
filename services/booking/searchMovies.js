import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const searchMovies = async (searchTerm) => {
    const results = await prisma.booking_movie.findMany({
        where: {
            title: {
                contains: searchTerm,
            },
        },
    });

    return results.map((pic) => {
        return {
            ...pic,
            movie_img: transformImgSource(pic, { imgKey: 'movie_img', urlKey: 'poster_img' }),
        };
    });
};
