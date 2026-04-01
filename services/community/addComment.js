import prisma from '../../utils/prisma-client.js';
import { COMMENT_STATUS } from '../../config/community-info.js';

export const addComment = async (context, status, postId, userId) => {
    // Convert status to number. If it's a string like "posted", map to constants.
    let numericStatus = parseInt(status);
    if (isNaN(numericStatus)) {
        // 如果字串是 'posted' 則設為發佈，否則預設為隱藏
        numericStatus = status === 'posted' ? COMMENT_STATUS.POSTED : COMMENT_STATUS.HIDDEN;
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
