import prisma from "../../utils/prisma-client.js";

export const getSavedPosts = async (sid, page, perPage) => {
    const totalRows = await prisma.comm_saved.count({ where: { user_id: sid } });
    if (totalRows === 0) return { totalRows, data: [] };

    const totalPages = Math.ceil(totalRows / perPage);
    const savedPosts = await prisma.comm_saved.findMany({
        where: { user_id: sid },
        orderBy: { comm_saved_id: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
            comm_post: {
                include: {
                    member_user: { select: { user_id: true, email: true, username: true, avatar: true } },
                    comm_photo: { select: { photo_name: true, img: true }, take: 1 }
                }
            }
        }
    });

    const formattedData = savedPosts.map(item => {
        const post = item.comm_post;
        const author = post?.member_user;
        const photo = post?.comm_photo?.[0];
        let imgData = null;
        if (photo?.img) {
            imgData = `data:image/jpeg;base64,${Buffer.from(photo.img).toString('base64')}`;
        }
        return {
            save_id: item.comm_saved_id,
            post_id: post?.post_id,
            post_context: post?.context,
            created_at: post?.created_at,
            updated_at: post?.updated_at,
            post_userId: post?.user_id,
            author_id: author?.user_id,
            email: author?.email,
            username: author?.username,
            avatar: author?.avatar,
            photo_name: photo?.photo_name,
            img: imgData
        };
    });

    return { totalRows, totalPages, data: formattedData };
};

export const deleteSavedPost = async (save_id) => {
    const existing = await prisma.comm_saved.findUnique({ where: { comm_saved_id: save_id } });
    if (!existing) return null;
    return await prisma.comm_saved.delete({ where: { comm_saved_id: save_id } });
};
