import prisma from "../../utils/prisma-client.js";

export const getSavedMovies = async (sid, page, perPage) => {
    const totalRows = await prisma.booking_movie_saved.count({ where: { user_id: sid } });
    if (totalRows === 0) return { totalRows, data: [] };

    const totalPages = Math.ceil(totalRows / perPage);
    const savedMovies = await prisma.booking_movie_saved.findMany({
        where: { user_id: sid },
        orderBy: { booking_movie_saved_id: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
    });

    const formattedData = [];
    for (const item of savedMovies) {
        const movie = await prisma.booking_movie.findUnique({
            where: { movie_id: item.movie_id },
            include: { booking_movie_type: true }
        });
        const user = await prisma.member_user.findUnique({
            where: { user_id: item.user_id },
            select: { email: true, username: true }
        });
        let imgData = null;
        if (movie?.movie_img) {
            imgData = `data:image/jpeg;base64,${Buffer.from(movie.movie_img).toString('base64')}`;
        }
        formattedData.push({
            save_id: item.booking_movie_saved_id,
            email: user?.email,
            username: user?.username,
            title: movie?.title,
            movie_id: movie?.movie_id,
            description: movie?.movie_description,
            rating: movie?.movie_rating,
            img_name: movie?.poster_img,
            img: imgData,
            type: movie?.booking_movie_type?.movie_type
        });
    }

    return { totalRows, totalPages, data: formattedData };
};

export const deleteSavedMovie = async (save_id) => {
    const existing = await prisma.booking_movie_saved.findUnique({ where: { booking_movie_saved_id: save_id } });
    if (!existing) return null;
    return await prisma.booking_movie_saved.delete({ where: { booking_movie_saved_id: save_id } });
};
