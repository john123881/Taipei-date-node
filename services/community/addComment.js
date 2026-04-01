import prisma from '../../utils/prisma-client.js';
import { COMMENT_STATUS } from '../../config/community-info.js';

export const addComment = async (context, status, postId, userId) => {
    // Convert status to number if needed.
    let numericStatus = parseInt(status);
    if (isNaN(numericStatus)) {
        numericStatus = status === 'posted' ? COMMENT_STATUS.POSTED : COMMENT_STATUS.HIDDEN;
    }

    try {
        const newComment = await prisma.comm_comment.create({
            data: {
                context,
                status: String(numericStatus),
                // 使用 connect 語法確保關聯正確
                comm_post: {
                    connect: { post_id: Number(postId) }
                },
                member_user: {
                    connect: { user_id: Number(userId) }
                }
            },
            include: {
                member_user: {
                    select: {
                        email: true,
                        username: true,
                        avatar: true,
                    }
                }
            }
        });

        // 返回與 getComments 一致的結構，確保前端顯示正確
        return {
            comm_comment_id: newComment.comm_comment_id,
            context: newComment.context,
            post_id: newComment.post_id,
            user_id: newComment.user_id,
            email: newComment.member_user?.email || '',
            username: newComment.member_user?.username || '已刪除使用者',
            avatar: newComment.member_user?.avatar || null,
            created_at: newComment.created_at,
        };
    } catch (err) {
        console.error('[Prisma Error in addComment]:', err);
        throw err;
    }
};
