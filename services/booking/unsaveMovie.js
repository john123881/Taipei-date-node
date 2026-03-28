import prisma from '../../utils/prisma-client.js';

export const unsaveMovie = async (movieId, userId) => {
    return await prisma.booking_movie_saved.deleteMany({
        where: {
            movie_id: Number(movieId),
            user_id: Number(userId),
        },
    });
};
