import prisma from '../../utils/prisma-client.js';

export const follow = async (userId, followingId) => {
    // 1. 檢查是否已經追蹤 (避免資料庫層面報錯)
    const existing = await prisma.comm_follows.findFirst({
        where: {
            follower_id: Number(userId),
            following_id: Number(followingId),
        },
    });

    if (existing) {
        return existing;
    }

    // 2. 建立新追蹤
    const results = await prisma.comm_follows.create({
        data: {
            follower_id: Number(userId),
            following_id: Number(followingId),
        },
    });
    return results;
};
