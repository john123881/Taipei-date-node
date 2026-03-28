import prisma from '../../utils/prisma-client.js';

export const getFriendshipsMessages = async (page = 1, perPage = 25) => {
    try {
        const totalRows = await prisma.friendships_message.count();
        const totalPages = Math.ceil(totalRows / perPage);

        const rows = await prisma.friendships_message.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                member_user: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                message_id: 'asc',
            },
        });

        // 格式化以符合原始 API 結構
        const data = rows.map((row) => ({
            message_id: row.message_id,
            friendship_id: row.friendship_id,
            sender_id: row.member_user?.username,
            sender_avatar: row.member_user?.avatar,
            content: row.content,
            sended_at: row.sended_at,
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
        console.error('getFriendshipsMessages error:', error);
        throw error;
    }
};
