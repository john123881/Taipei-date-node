import prisma from '../../utils/prisma-client.js';

export const addComment = async (context, status, postId, userId) => {
    // Convert status to number. If it's a string like "posted", map to 1.
    let numericStatus = parseInt(status);
    if (isNaN(numericStatus)) {
        numericStatus = status === 'posted' ? 1 : 1;
    }

    const results = await prisma.comm_comment.create({
        data: {
            context,
            status: numericStatus,
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
