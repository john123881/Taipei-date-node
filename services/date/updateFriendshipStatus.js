import prisma from '../../utils/prisma-client.js';

export const updateFriendshipStatus = async (friendship_id, friendship_status) => {
    try {
        const data = {
            friendship_status,
            updated_at: new Date()
        };

        if (friendship_status === 'accepted') {
            data.confirmed_at = new Date();
        }

        return await prisma.friendships.update({
            where: {
                friendship_id: Number(friendship_id),
            },
            data
        });
    } catch (error) {
        console.error('updateFriendshipStatus error:', error);
        throw error;
    }
};
