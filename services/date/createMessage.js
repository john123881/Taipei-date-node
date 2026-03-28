import prisma from '../../utils/prisma-client.js';

export const createMessage = async (friendship_id, sender_id, content, msg_type = 'T') => {
    try {
        return await prisma.friendships_message.create({
            data: {
                friendship_id: Number(friendship_id),
                sender_id: Number(sender_id),
                msg_type,
                content,
                sended_at: new Date(),
            },
        });
    } catch (error) {
        console.error('createMessage error:', error);
        throw error;
    }
};
