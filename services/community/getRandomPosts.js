import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getRandomPosts = async (page = 1, limit = 12) => {
    const offset = (Number(page) - 1) * Number(limit);
    
    // queryRaw handles RAND() which is not native to Prisma
    const results = await prisma.$queryRaw`
        SELECT 
            posts.post_id, 
            posts.context AS post_context,
            posts.created_at,
            posts.updated_at,
            posts.user_id AS post_userId,
            users.email,
            users.username,
            users.avatar,
            photos.photo_name,
            photos.img,
            photos.img_url
        FROM 
            comm_post AS posts
        LEFT JOIN 
            member_user AS users 
        ON 
            posts.user_id = users.user_id
        LEFT JOIN 
            comm_photo AS photos 
        ON 
            posts.post_id = photos.post_id
        ORDER BY 
            RAND() 
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    return results.map((post) => {
        const imgSource = transformImgSource(post);

        return {
            ...post,
            img: imgSource,
        };
    });
};
