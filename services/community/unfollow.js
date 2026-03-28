import prisma from '../../utils/prisma-client.js';

export const unfollow = async (userId, FollowingId) => {
    const results = await prisma.comm_follows.deleteMany({
        where: {
            follower_id: Number(userId),
            following_id: Number(FollowingId),
        },
    });
    return results;
};
