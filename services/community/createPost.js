import db from '../../utils/mysql2-connect.js';

export const createPost = async (context, userId) => {
    const [results] = await db.query(
        `INSERT INTO comm_post(context, user_id) VALUES (?, ?)`,
        [context, userId]
    );

    const newPostId = results.insertId;

    const getNewPostQuery = `
    SELECT 
        posts.post_id, 
        posts.context AS post_context,
        posts.created_at,
        posts.updated_at,
        posts.user_id AS post_userId,
        users.email,
        users.username,
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
        posts.post_id = ?
    `;

    const [postResults] = await db.query(getNewPostQuery, [newPostId]);

    if (postResults.length > 0) {
        const post = postResults[0];

        if (post.img) {
            const imageBase64 = Buffer.from(post.img).toString('base64');
            post.img = `data:image/jpeg;base64,${imageBase64}`;
        }

        return post;
    }

    return results;
};
