import prisma from '../../utils/prisma-client.js';

export const getMovieTypes = async (page = 1, perPage = 25) => {
    try {
        const totalRows = await prisma.booking_movie_type.count();
        const totalPages = Math.ceil(totalRows / perPage);

        const data = await prisma.booking_movie_type.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { movie_type_id: 'asc' }
        });

        return {
            success: true,
            totalRows,
            totalPages,
            page,
            perPage,
            data
        };
    } catch (error) {
        console.error('getMovieTypes error:', error);
        throw error;
    }
};
