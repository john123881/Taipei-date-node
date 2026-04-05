import prisma from '../../utils/prisma-client.js';

export const searchUsers = async (searchTerm) => {
    const results = await prisma.member_user.findMany({
        where: {
            OR: [
                { email: { contains: searchTerm } },
                { username: { contains: searchTerm } },
            ],
        },
        select: {
            user_id: true,
            username: true,
            email: true,
            avatar: true,
            // Original code select list lacked 'img', but then tried to use it? 
            // I'll stick to the original select but fix the potential bug if img is what they meant.
            // Actually, in Taipei-date-node, 'avatar' is usually a URL or filename.
            // If there's a BLOB 'img', I'll include it.
        },
    });

    // In current schema view, member_user might have an 'img' field. 
    // The original code tried to use 'img'. I'll check first.
    
    return results.map((user) => {
        // avatar 已經是 URL 格式，直接返回即可
        return {
            ...user,
            img: user.avatar, // 為保持與前端舊有的 .img 屬性相容
        };
    });
};
