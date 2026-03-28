import prisma from '../../utils/prisma-client.js';

// 新增單筆 movie 資料到 trip_details
export const createContentMovie = async (trip_plan_id, movie_id, block) => {
    return await prisma.trip_details.create({
        data: {
            trip_plan_id: Number(trip_plan_id),
            block: Number(block),
            movie_id: Number(movie_id),
        },
    });
};
