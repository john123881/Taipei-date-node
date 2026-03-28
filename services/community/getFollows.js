import prisma from '../../utils/prisma-client.js';

export const getFollows = async (followingId, followerId) => {
    const followersCount = await prisma.comm_follows.count({
        where: {
            following_id: Number(followingId),
        },
    });

    const followingCount = await prisma.comm_follows.count({
        where: {
            follower_id: Number(followerId),
        },
    });

    return [
        { relation_type: 'followers', count: followersCount },
        { relation_type: 'following', count: followingCount },
    ];
};
