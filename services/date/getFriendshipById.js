import prisma from '../../utils/prisma-client.js';

export const getFriendshipById = async (friendship_id) => {
    try {
        const row = await prisma.friendships.findUnique({
            where: {
                friendship_id: Number(friendship_id),
            },
            include: {
                member_user_friendships_user_id1Tomember_user: {
                    select: { username: true, avatar: true }
                },
                member_user_friendships_user_id2Tomember_user: {
                    select: { username: true, avatar: true }
                }
            }
        });

        if (!row) return null;

        return {
            ...row,
            user_id1_name: row.member_user_friendships_user_id1Tomember_user?.username,
            user_id1_avatar: row.member_user_friendships_user_id1Tomember_user?.avatar,
            user_id2_name: row.member_user_friendships_user_id2Tomember_user?.username,
            user_id2_avatar: row.member_user_friendships_user_id2Tomember_user?.avatar,
        };
    } catch (error) {
        console.error('getFriendshipById error:', error);
        throw error;
    }
};
