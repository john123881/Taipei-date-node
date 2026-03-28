import prisma from '../../utils/prisma-client.js';

export const getAcceptedFriends = async (user_id) => {
    try {
        const userIdNum = Number(user_id);
        const rows = await prisma.friendships.findMany({
            where: {
                friendship_status: 'accepted',
                OR: [
                    { user_id1: userIdNum },
                    { user_id2: userIdNum }
                ]
            },
            include: {
                member_user_friendships_user_id1Tomember_user: {
                    select: { username: true, avatar: true }
                },
                member_user_friendships_user_id2Tomember_user: {
                    select: { username: true, avatar: true }
                }
            },
            orderBy: {
                friendship_id: 'asc'
            }
        });

        return rows.map(row => ({
            ...row,
            user_id1_name: row.member_user_friendships_user_id1Tomember_user?.username,
            user_id1_avatar: row.member_user_friendships_user_id1Tomember_user?.avatar,
            user_id2_name: row.member_user_friendships_user_id2Tomember_user?.username,
            user_id2_avatar: row.member_user_friendships_user_id2Tomember_user?.avatar,
        }));
    } catch (error) {
        console.error('getAcceptedFriends error:', error);
        throw error;
    }
};
