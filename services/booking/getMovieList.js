import prisma from '../../utils/prisma-client.js';

export const getMovieList = async () => {
    const results = await prisma.booking_movie.findMany({
        select: {
            movie_id: true,
            title: true,
            poster_img: true,
            movie_description: true,
            movie_rating: true,
            movie_type_id: true,
            movie_img: true,
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