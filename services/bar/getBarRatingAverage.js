import prisma from '../../utils/prisma-client.js';

export const getBarRatingAverage = async (bar_id) => {
    const id = Number(bar_id);
    if (isNaN(id)) return null;

    const aggregate = await prisma.bar_rating.aggregate({
        _avg: {
            bar_rating_star: true,
        },
        where: {
            bar_id: id,
        },
    });

    const bar = await prisma.bars.findUnique({
        where: {
            bar_id: Number(bar_id),
        },
        select: {
            bar_name: true,
        },
    });

    if (bar) {
        return {
            barName: bar.bar_name,
            averageRating: aggregate._avg.bar_rating_star,
        };
    } else {
        return null;
    }
};
