import prisma from '../../utils/prisma-client.js';

export const savePost = async (postId, userId) => {
    const results = await prisma.comm_saved.create({
        data: {
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
