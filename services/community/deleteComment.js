import prisma from '../../utils/prisma-client.js';

export const deleteComment = async (commentId) => {
    const results = await prisma.comm_comment.delete({
        where: {
            comm_comment_id: Number(commentId),
        },
    });

    return results;
};
