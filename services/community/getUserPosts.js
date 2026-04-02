import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getUserPosts = async (userId, page = 1, limit = 12) => {
    const skip = (Number(page) - 1) * Number(limit);
    const results = await prisma.comm_post.findMany({
        where: {
            user_id: Number(userId),
        },
        take: Number(limit),
        skip: skip,
        orderBy: {
            post_id: 'desc',
        },
        include: {
            member_user: {
                select: {
                    email: true,
                    username: true,
                    avatar: true,
                },
            },
            comm_photo: {
                select: {
                    photo_name: true,
                    img: true,
                    img_url: true,
                },
            },
        },
    });

    return results.map((post) => {
        const photo = post.comm_photo[0];
        const imgSource = transformImgSource(photo);

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
            img: imgSource,
        };
    });
};
