import prisma from '../../utils/prisma-client.js';

export const getBookingSystem = async () => {
    const results = await prisma.booking_system.findMany({
        take: 30,
        include: {
            booking_movie: true,
        },
    });

    return results.map((item) => {
        const pic = item.booking_movie;
        if (pic && pic.movie_img) {
            const imageBase64 = Buffer.from(pic.movie_img).toString('base64');
            return {
                ...item,
                ...pic,
                movie_img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return {
            ...item,
            ...pic,
        };
    });
};
