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
            throw new Error('Friendship already exists');
        }

        return await prisma.friendships.create({
            data: {
                user_id1: u1,
                user_id2: u2,
                friendship_status,
                send_at: new Date(),
                confirmed_at: null,
                updated_at: new Date(),
            }
        });
    } catch (error) {
        console.error('createFriendship error:', error);
        throw error;
    }
};
