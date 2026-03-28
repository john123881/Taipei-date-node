import prisma from '../../utils/prisma-client.js';

export const unlikePost = async (postId, userId) => {
    const results = await prisma.comm_likes.deleteMany({
        where: {
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
