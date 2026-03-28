import prisma from '../../utils/prisma-client.js';

export const searchMovies = async (searchTerm) => {
    const results = await prisma.booking_movie.findMany({
        where: {
            title: {
                contains: searchTerm,
            },
        },
    });

    return results.map((pic) => {
        if (pic.movie_img) {
            const imageBase64 = Buffer.from(pic.movie_img).toString('base64');
            return {
                ...pic,
                movie_img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return pic;
    });
};
