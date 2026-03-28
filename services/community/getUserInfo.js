import prisma from '../../utils/prisma-client.js';

export const getUserInfo = async (userId) => {
    const results = await prisma.member_user.findUnique({
        where: {
            user_id: Number(userId),
        },
    });
    return results;
};
