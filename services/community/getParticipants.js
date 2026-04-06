import prisma from '../../utils/prisma-client.js';

export const getParticipants = async (eventId) => {
    try {
        // 1. 先獲取所有參與者的 ID
        const participants = await prisma.comm_participants.findMany({
            where: {
                comm_event_id: Number(eventId),
            },
            select: {
                user_id: true,
            },
        });

        if (participants.length === 0) return [];

        const userIds = participants.map((p) => p.user_id);

        // 2. 獲取參與者的詳細資訊
        const users = await prisma.member_user.findMany({
            where: {
                user_id: {
                    in: userIds,
                },
            },
            select: {
                user_id: true,
                username: true,
                email: true,
                avatar: true,
            },
        });

        return users;
    } catch (error) {
        console.error('[Service Error] getParticipants:', error);
        throw error;
    }
};
