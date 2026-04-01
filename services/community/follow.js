import prisma from '../../utils/prisma-client.js';

export const follow = async (userId, followingId) => {
    const results = await prisma.comm_follows.create({
        data: {
            follower_id: Number(userId),
            following_id: Number(followingId),
        },
    });
    return results;
};
