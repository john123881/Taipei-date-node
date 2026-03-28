import prisma from '../../utils/prisma-client.js';

export const getMyMoviePhoto = async (trip_plan_id) => {
    return await prisma.trip_details.findMany({
        where: {
            trip_plan_id: Number(trip_plan_id),
        },
        include: {
            booking_movie: true,
        },
    });
};
