import prisma from '../../utils/prisma-client.js';

export const getComments = async (postIds) => {
    const eIds = postIds
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

    if (eIds.length === 0) return [];

    const results = await prisma.comm_comment.findMany({
        where: {
            post_id: { in: eIds },
        },
        include: {
            member_user: {
                select: {
                    email: true,
                    username: true,
                    avatar: true,
                },
            },
        },
    });

    return results.map((c) => ({
        comm_comment_id: c.comm_comment_id,
        context: c.context,
        post_id: c.post_id,
        user_id: c.user_id,
        email: c.member_user?.email || '',
        username: c.member_user?.username || '已刪除使用者',
        avatar: c.member_user?.avatar || null,
    }));
};
