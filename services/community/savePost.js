import prisma from '../../utils/prisma-client.js';

export const savePost = async (postId, userId) => {
    // 檢查是否已經收藏
    const existing = await prisma.comm_saved.findFirst({
        where: {
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });

    if (existing) {
        return existing;
    }

    const results = await prisma.comm_saved.create({
        data: {
            post_id: Number(postId),
            user_id: Number(userId),
        },
    });
    return results;
};
