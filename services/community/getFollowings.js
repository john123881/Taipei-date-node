import prisma from '../../utils/prisma-client.js';

export const getFollowings = async (followerId) => {
    const results = await prisma.comm_follows.findMany({
        where: {
            follower_id: Number(followerId),
        },
        include: {
            following: {
                select: {
                    user_id: true,
                    username: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });

    return results.map((f) => f.following);
};
