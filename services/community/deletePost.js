import prisma from '../../utils/prisma-client.js';

export const deletePost = async (postId) => {
    const results = await prisma.comm_post.delete({
        where: {
            post_id: Number(postId),
        },
    });

    return results;
};
