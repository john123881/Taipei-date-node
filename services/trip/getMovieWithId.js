import prisma from '../../utils/prisma-client.js';

export const getMovieWithId = async (trip_plan_id) => {
    return await prisma.booking_movie.findMany({
        where: {
            trip_details: {
                some: {
                    trip_plan_id: Number(trip_plan_id),
                },
            },
        },
        include: {
            booking_movie_type: {
                select: {
                    movie_type: true,
                },
            },
        },
    });
};
