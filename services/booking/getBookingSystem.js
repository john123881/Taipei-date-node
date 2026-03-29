import prisma from '../../utils/prisma-client.js';

export const getBookingSystem = async () => {
    const results = await prisma.booking_system.findMany({
        take: 30,
        orderBy: { created_at: 'desc' },
        include: {
            booking_movie: true
        }
    });

    return results.map((item) => {
        const movie = item.booking_movie;
        if (movie && movie.movie_img) {
            movie.movie_img = `data:image/jpeg;base64,${Buffer.from(movie.movie_img).toString('base64')}`;
        }
        
        // 合併資料以維持舊有格式
        const { booking_movie, ...rest } = item;
        return {
            ...rest,
            ...(booking_movie || {})
        };
    });
};
