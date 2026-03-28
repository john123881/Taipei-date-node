import prisma from '../../utils/prisma-client.js';

export const markNotiAsRead = async (notiId, userId) => {
    const results = await prisma.comm_noti.updateMany({
        where: {
            comm_noti_id: Number(notiId),
            receiver_id: Number(userId),
        },
        data: {
            is_read: 1,
        },
    });
    return results;
};
