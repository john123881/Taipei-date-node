import prisma from '../../utils/prisma-client.js';

export const addComment = async (context, status, postId, userId) => {
    const results = await prisma.comm_comment.create({
        data: {
            context,
            status: Number(status),
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
