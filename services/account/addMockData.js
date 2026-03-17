import prisma from "../../utils/prisma-client.js";

export const addMockData = async (dataArray) => {
    const results = [];
    for (const data of dataArray) {
        const existingEmail = await prisma.member_user.findFirst({ where: { email: data.email } });
        if (existingEmail) throw new Error('EMAIL_ALREADY_EXISTS');

        const existingId = await prisma.member_user.findUnique({ where: { user_id: data.user_id } });
        if (existingId) throw new Error('USER_ID_ALREADY_EXISTS');

        const newUser = await prisma.member_user.create({
            data: {
                ...data,
                birthday: data.birthday ? new Date(data.birthday) : null,
                user_active: !!data.user_active
            }
        });

        results.push({ success: true, username: newUser.username, email: newUser.email });
    }
    return results;
};
