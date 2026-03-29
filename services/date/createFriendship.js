import prisma from '../../utils/prisma-client.js';

export const createFriendship = async (user_id1, user_id2, friendship_status = 'pending') => {
    try {
        const u1 = Number(user_id1);
        const u2 = Number(user_id2);

        // 檢查是否已存在
        const existing = await prisma.friendships.findFirst({
            where: {
                OR: [
                    { user_id1: u1, user_id2: u2 },
                    { user_id1: u2, user_id2: u1 }
                ]
            }
        });

        if (existing) {
            // 如果已存在且目前狀態只是要更新（例如從 pending 變成 rejected）
            return await prisma.friendships.update({
                where: { friendship_id: existing.friendship_id },
                data: {
                    friendship_status,
                    updated_at: new Date(),
                    confirmed_at: friendship_status === 'accepted' ? new Date() : existing.confirmed_at,
                }
            });
        }

        const insertData = {
            user_id1: u1,
            user_id2: u2,
            friendship_status,
        };

        // Only add confirmed_at if it's actually accepted
        if (friendship_status === 'accepted') {
            insertData.confirmed_at = new Date();
        } else {
            // If the Prisma client thinks it's non-nullable, we might need a dummy or skip
            // But usually omitting it is safer if it's optional or has a default.
        }

        return await prisma.friendships.create({
            data: insertData
        });
    } catch (error) {
        console.error('createFriendship error:', error);
        throw error;
    }
};
