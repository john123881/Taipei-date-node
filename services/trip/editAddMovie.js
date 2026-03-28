import prisma from '../../utils/prisma-client.js';

export const editAddMovie = async (trip_detail_id, movie_id) => {
    try {
        return await prisma.trip_details.update({
            where: {
                trip_detail_id: Number(trip_detail_id),
            },
            data: {
                movie_id: Number(movie_id),
            },
        });
    } catch (error) {
        console.error('Error updating movie in trip detail:', error);
        throw error;
    }
};
