import prisma from '../../utils/prisma-client.js';
import { Prisma } from '@prisma/client';

export const getComments = async (postIds) => {
    const eIds = (Array.isArray(postIds) ? postIds : [postIds])
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

    if (eIds.length === 0) return [];

    const results = await prisma.$queryRaw`
        SELECT 
            c.comm_comment_id,
            c.context,
            c.post_id,
            c.user_id,
            c.created_at,
            u.email,
            u.username,
            u.avatar
        FROM 
            comm_comment c
        LEFT JOIN 
            member_user u ON c.user_id = u.user_id
        WHERE 
            c.post_id IN (${Prisma.join(eIds)})
        ORDER BY 
            c.created_at DESC
    `;

    return results.map((c) => ({
        comm_comment_id: c.comm_comment_id,
        context: c.context,
        post_id: c.post_id,
        user_id: c.user_id,
        email: c.email || '',
        username: c.username || '已刪除使用者',
        avatar: c.avatar || null,
        created_at: c.created_at,
    }));
};
