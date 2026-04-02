import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getSuggestUsers = async () => {
    // Prisma does not natively support ORDER BY RAND()
    // Using $queryRaw as a safe fallback
    const results = await prisma.$queryRaw`
        SELECT user_id, email, username, avatar
        FROM member_user 
        ORDER BY RAND() 
        LIMIT 5
    `;

    return results.map(user => ({
        ...user,
        avatar: transformImgSource(user, { imgKey: 'avatar', urlKey: 'avatar' })
    }));
};
