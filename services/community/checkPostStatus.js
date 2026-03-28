import prisma from '../../utils/prisma-client.js';

export const checkPostStatus = async (userId, postIds) => {
    const uId = Number(userId);
    const pIds = postIds.map(id => Number(id));

    const likes = await prisma.comm_likes.findMany({
        where: {
            user_id: uId,
            post_id: { in: pIds },
        },
        select: { post_id: true },
    });

    const saved = await prisma.comm_saved.findMany({
        where: {
            user_id: uId,
            post_id: { in: pIds },
        },
        select: { post_id: true },
    });

    const likedSet = new Set(likes.map(l => l.post_id));
    const savedSet = new Set(saved.map(s => s.post_id));

    return pIds.map(postId => ({
        postId,
        isLiked: likedSet.has(postId),
        isSaved: savedSet.has(postId),
    }));
};
