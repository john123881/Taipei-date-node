import prisma from '../../utils/prisma-client.js';

export const unsavePost = async (postId, userId) => {
    const results = await prisma.comm_saved.deleteMany({
        where: {
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
