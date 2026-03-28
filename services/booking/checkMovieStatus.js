import prisma from '../../utils/prisma-client.js';

export const checkMovieStatus = async (userId, movieIds) => {
    const savedMovies = await prisma.booking_movie_saved.findMany({
        where: {
            user_id: Number(userId),
            movie_id: {
                in: movieIds.map((id) => Number(id)),
            },
        },
        select: {
            movie_id: true,
        },
    });

    const savedMovieIds = new Set(savedMovies.map((m) => m.movie_id));

    return movieIds.map((id) => ({
        movieId: Number(id),
        isSaved: savedMovieIds.has(Number(id)),
    }));
};
