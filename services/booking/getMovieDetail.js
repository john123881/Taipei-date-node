import prisma from '../../utils/prisma-client.js';

export const getMovieDetail = async (movieId) => {
    const movie = await prisma.booking_movie.findUnique({
        where: {
            movie_id: Number(movieId),
        },
        select: {
            movie_id: true,
            title: true,
            poster_img: true,
            movie_description: true,
            movie_rating: true,
            movie_type_id: true,
            youtube_id: true,
            movie_img: true,
        },
    });

    if (!movie) return [];

    let result = { ...movie };
    if (movie.movie_img) {
        const imageBase64 = Buffer.from(movie.movie_img).toString('base64');
        result.movie_img = `data:image/jpeg;base64,${imageBase64}`;
    }

    return [result];
};
