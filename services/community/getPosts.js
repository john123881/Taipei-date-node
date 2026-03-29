import prisma from '../../utils/prisma-client.js';

export const getPosts = async (page = 1, limit = 12) => {
    const skip = (Number(page) - 1) * Number(limit);
    const results = await prisma.comm_post.findMany({
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
        const photo = post.comm_photo[0]; // SQL join was 1:1 or first
        let imgSource = null;
        if (photo && photo.img_url) {
            imgSource = photo.img_url;
        } else if (photo && photo.img) {
            imgSource = `data:image/jpeg;base64,${Buffer.from(photo.img).toString('base64')}`;
        }

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
