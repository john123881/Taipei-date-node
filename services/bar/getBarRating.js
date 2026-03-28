import prisma from '../../utils/prisma-client.js';

export const getBarRating = async () => {
    const results = await prisma.bar_rating.findMany({
        include: {
            bars: {
                select: {
                    bar_id: true,
                    bar_name: true,
                },
            },
            member_user: {
                select: {
                    user_id: true,
                    username: true,
                    avatar: true,
                },
            },
        },
    });

    return results.map((rating) => ({
        ...rating,
        bar_name: rating.bars?.bar_name,
        bar_id: rating.bars?.bar_id,
        user_id: rating.member_user?.user_id,
        username: rating.member_user?.username,
        avatar: rating.member_user?.avatar,
    }));
};