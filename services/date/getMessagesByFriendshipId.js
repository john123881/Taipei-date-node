import prisma from '../../utils/prisma-client.js';

export const getMessagesByFriendshipId = async (friendship_id) => {
    try {
        const rows = await prisma.friendships_message.findMany({
            where: {
                friendship_id: Number(friendship_id),
            },
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
            friendship_id: row.friendship_id,
            sender_id: row.member_user?.username,
            sender_avatar: row.member_user?.avatar,
            message_id: row.message_id,
            msg_type: row.msg_type,
            content: row.content,
            sended_at: row.sended_at,
        }));

        return data;
    } catch (error) {
        console.error('getMessagesByFriendshipId error:', error);
        throw error;
    }
};
