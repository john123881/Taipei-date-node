import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getPosts = async (page = 1, limit = 12, seed = null) => {
    const offset = (Number(page) - 1) * Number(limit);
    
    // 如果沒有提供 seed，則使用當前的日期作為種子 (或是由前端傳入)
    // 預設一小時更換一次隨機順序
    const finalSeed = (seed !== null && seed !== undefined) ? Number(seed) : Math.floor(Date.now() / 3600000);

    // 使用 queryRaw 進行隨機排序，並與 getRandomPosts 的邏輯一致
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
            RAND(${finalSeed}) 
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    return results.map((post) => {
        const imgSource = transformImgSource(post);

        return {
            ...post,
            img: imgSource,
        };
    });
};
