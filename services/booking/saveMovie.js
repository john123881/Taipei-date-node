import prisma from '../../utils/prisma-client.js';

export const saveMovie = async (movieId, userId) => {
    // 檢查是否已經收藏
    const existing = await prisma.booking_movie_saved.findFirst({
        where: {
            movie_id: Number(movieId),
            user_id: Number(userId),
        },
    });

    if (existing) {
        return existing;
    }

    return await prisma.booking_movie_saved.create({
        data: {
            movie_id: Number(movieId),
            user_id: Number(userId),
        },
    });
};
