import prisma from '../../utils/prisma-client.js';

export const getMovie = async () => {
    return await prisma.booking_movie.findMany({
        include: {
            booking_movie_type: {
                select: {
                    movie_type: true,
                },
            },
        },
    });
};
