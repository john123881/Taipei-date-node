import prisma from '../../utils/prisma-client.js';

export const likePost = async (postId, userId) => {
    const results = await prisma.comm_likes.create({
        data: {
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
