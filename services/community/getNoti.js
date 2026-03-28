import prisma from '../../utils/prisma-client.js';

export const getNoti = async (userId) => {
    const results = await prisma.comm_noti.findMany({
        where: {
            receiver_id: Number(userId),
        },
        include: {
            sender: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });

    return results.map((n) => ({
        notiId: n.comm_noti_id,
        senderId: n.sender_id,
        receiver_id: n.receiver_id,
        type: n.type,
        message: n.message,
        isRead: n.is_read,
        postId: n.post_id,
        created_at: n.created_at,
        updated_at: n.updated_at,
        senderName: n.sender.username,
        avatar: n.sender.avatar,
    }));
};
