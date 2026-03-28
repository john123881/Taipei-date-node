import prisma from '../../utils/prisma-client.js';

export const updateUserBarType = async (user_id, bar_type_name) => {
    try {
        const barType = await prisma.bar_type.findFirst({
            where: { bar_type_name }
        });

        if (!barType) {
            throw new Error('找不到指定的酒吧類型');
        }

        return await prisma.member_user.update({
            where: { user_id: Number(user_id) },
            data: { bar_type_id: barType.bar_type_id }
        });
    } catch (error) {
        console.error('updateUserBarType error:', error);
        throw error;
    }
};
