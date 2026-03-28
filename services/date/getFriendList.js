import prisma from '../../utils/prisma-client.js';

export const getFriendList = async (page = 1, perPage = 25) => {
    try {
        const totalRows = await prisma.friendships.count();
        const totalPages = Math.ceil(totalRows / perPage);

        const rows = await prisma.friendships.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                member_user_friendships_user_id1Tomember_user: {
                    select: { username: true, avatar: true }
                },
                member_user_friendships_user_id2Tomember_user: {
                    select: { username: true, avatar: true }
                }
            },
            orderBy: {
                friendship_id: 'asc',
            },
        });

        const data = rows.map((row) => ({
            friendship_id: row.friendship_id,
            user_id1: row.member_user_friendships_user_id1Tomember_user?.username,
            user_id1_avatar: row.member_user_friendships_user_id1Tomember_user?.avatar,
            user_id2: row.member_user_friendships_user_id2Tomember_user?.username,
            user_id2_avatar: row.member_user_friendships_user_id2Tomember_user?.avatar,
            friendship_status: row.friendship_status,
            send_at: row.send_at,
            confirmed_at: row.confirmed_at,
            updated_at: row.updated_at,
        }));

        return {
            success: true,
            totalRows,
            totalPages,
            page,
            perPage,
            data,
        };
    } catch (error) {
        console.error('getFriendList error:', error);
        throw error;
    }
};
