import prisma from '../../utils/prisma-client.js';

export const getIndexMovieList = async () => {
    // Prisma does not have a native order-by-rand, so we use queryRaw safely
    const results = await prisma.$queryRaw`
        SELECT 
            movie_id, title, poster_img, movie_description, movie_rating, movie_type_id, movie_img, movie_img_url
        FROM 
            booking_movie
        ORDER BY RAND()
        LIMIT 6
    `;

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
