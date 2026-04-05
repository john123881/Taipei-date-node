import prisma from '../../utils/prisma-client.js';

export const editComment = async (commentId, context) => {
    if (!commentId || !context) {
        throw new Error('缺少必要參數 (commentId, context)');
    }

    const updatedComment = await prisma.comm_comment.update({
        where: { comm_comment_id: Number(commentId) },
        data: {
            context: context,
            updated_at: new Date(),
        },
    });

    return updatedComment;
};
