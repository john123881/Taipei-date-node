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
