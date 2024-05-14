import db from '../../utils/mysql2-connect.js';

export const getPostsByKeyword = async (keyword, page = 1, limit = 12) => {
    const offset = (page - 1) * limit; // 計算起始位置
    const query = `
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
            photos.img
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
        WHERE 
            context LIKE ?
        ORDER BY 
            posts.post_id DESC
        LIMIT ? OFFSET ?`;

    const [results] = await db.query(query, [`%${keyword}%`, limit, offset]); // 傳遞limit和offset值

    // 將 BLOB 數據轉換為 Base64 字符串
    const posts = results.map((post) => {
        if (post.img) {
            const imageBase64 = Buffer.from(post.img).toString('base64');
            return {
                ...post,
                img: `data:image/jpeg;base64,${imageBase64}`,
            };
        }
        return post;
    });
    return posts;
};
