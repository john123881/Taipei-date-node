import prisma from '../../utils/prisma-client.js';

export const saveMovie = async (movieId, userId) => {
    return await prisma.booking_movie_saved.create({
        data: {
            movie_id: Number(movieId),
            user_id: Number(userId),
        },
    });
};
