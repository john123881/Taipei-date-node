import prisma from '../../utils/prisma-client.js';

export const getComments = async (postIds) => {
    const eIds = postIds.map((id) => Number(id));

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

    // Transform to match original output structure if needed,
    // though the include object is usually preferred in Prisma.
    // For exact compatibility with existing frontend:
    return results.map((c) => ({
        comm_comment_id: c.comm_comment_id,
        context: c.context,
        post_id: c.post_id,
        user_id: c.user_id,
        email: c.member_user.email,
        username: c.member_user.username,
        avatar: c.member_user.avatar,
    }));
};
