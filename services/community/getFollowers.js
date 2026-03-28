import prisma from '../../utils/prisma-client.js';

export const getFollowers = async (followingId) => {
    const results = await prisma.comm_follows.findMany({
        where: {
            following_id: Number(followingId),
        },
        include: {
            follower: {
                select: {
                    user_id: true,
                    username: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });

    return results.map((f) => f.follower);
};
