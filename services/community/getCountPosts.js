import prisma from '../../utils/prisma-client.js';

export const getCountPosts = async (userId) => {
    const count = await prisma.comm_post.count({
        where: {
            user_id: Number(userId),
        },
    });
    return [{ PostCount: count }];
};
