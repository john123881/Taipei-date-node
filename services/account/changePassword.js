import prisma from "../../utils/prisma-client.js";
import bcrypt from 'bcryptjs';

export const changePassword = async (userId, password, newPassword) => {
    const user = await prisma.member_user.findUnique({ where: { user_id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const result = await bcrypt.compare(password, user.password_hash);
    if (!result) throw new Error('INVALID_PASSWORD');

    const newPassword_hash = await bcrypt.hash(newPassword, 12);
    return await prisma.member_user.update({
        where: { user_id: userId },
        data: { password_hash: newPassword_hash, updated_at: new Date() }
    });
};
