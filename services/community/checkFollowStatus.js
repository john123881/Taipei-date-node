import prisma from '../../utils/prisma-client.js';

export const checkFollowStatus = async (userId, followingId) => {
    const result = await prisma.comm_follows.findFirst({
        where: {
            follower_id: Number(userId),
            following_id: Number(followingId),
        },
    });

    return {
        followingId: Number(followingId),
        isFollowing: !!result,
    };
};
