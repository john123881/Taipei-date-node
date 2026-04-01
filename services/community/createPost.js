import prisma from '../../utils/prisma-client.js';

export const createPost = async (context, userId) => {
    const newPost = await prisma.comm_post.create({
        data: {
            context,
            user_id: Number(userId),
        },
    });

    const post = await prisma.comm_post.findUnique({
        where: {
            post_id: newPost.post_id,
        },
        include: {
            member_user: {
                select: {
                    email: true,
                    username: true,
                },
            },
            comm_photo: {
                select: {
                    photo_name: true,
                    img: true,
                },
            },
        },
    });

    if (post) {
        const photo = post.comm_photo[0];
        
        return {
            post_id: post.post_id,
            post_context: post.context,
            created_at: post.created_at,
            updated_at: post.updated_at,
            post_userId: post.user_id,
            email: post.member_user?.email,
            username: post.member_user?.username,
            avatar: post.member_user?.avatar,
            photo_name: photo?.photo_name,
            img: photo?.img_url || null, // 直接回傳 S3 URL
        };
    }

    return newPost;
};
