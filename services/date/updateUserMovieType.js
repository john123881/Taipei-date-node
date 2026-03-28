import prisma from '../../utils/prisma-client.js';

export const updateUserMovieType = async (user_id, movie_type) => {
    try {
        const movieType = await prisma.booking_movie_type.findFirst({
            where: { movie_type }
        });

        if (!movieType) {
            throw new Error('找不到指定的電影類型');
        }

        return await prisma.member_user.update({
            where: { user_id: Number(user_id) },
            data: { movie_type_id: movieType.movie_type_id }
        });
    } catch (error) {
        console.error('updateUserMovieType error:', error);
        throw error;
    }
};
