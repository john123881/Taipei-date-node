import prisma from '../../utils/prisma-client.js';
import { uploadToS3 } from '../../utils/s3-core.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const editPostPhoto = async (photoName, imageData, postId) => {
    // 1. 上傳到 S3
    const s3Url = await uploadToS3(imageData, photoName, 'posts');

    // 2. 更新資料庫
    await prisma.comm_photo.updateMany({
        where: {
            post_id: Number(postId),
        },
        data: {
            photo_name: photoName,
            img: Buffer.alloc(0),
            img_url: s3Url,
        },
    });

    const post = await prisma.comm_post.findUnique({
        where: {
            post_id: Number(postId),
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

    if (post) {
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
    }

    return null;
};
