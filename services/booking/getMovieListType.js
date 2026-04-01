import prisma from '../../utils/prisma-client.js';

export const getMovieListType = async (movie_type_id) => {
    const results = await prisma.booking_movie.findMany({
        where: {
            movie_type_id: movie_type_id ? Number(movie_type_id) : undefined,
        },
        select: {
            movie_id: true,
            title: true,
            poster_img: true,
            movie_description: true,
            movie_rating: true,
            movie_type_id: true,
            movie_img: true,
            movie_img_url: true,
        },
    });

    return results.map((pic) => {
        let imgSource = null;
        if (pic.movie_img_url) {
            imgSource = pic.movie_img_url;
        } else if (pic.movie_img) {
            imgSource = `data:image/jpeg;base64,${Buffer.from(pic.movie_img).toString('base64')}`;
        }

        return {
            ...pic,
            movie_img: imgSource,
        };
    });
};
