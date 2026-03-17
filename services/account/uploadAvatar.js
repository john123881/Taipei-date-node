import prisma from "../../utils/prisma-client.js";

export const uploadAvatar = async (sid, location) => {
    return await prisma.member_user.update({
        where: { user_id: sid },
        data: {
            avatar: location,
            updated_at: new Date()
        }
    });
};
