import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';
import dayjs from 'dayjs';

export const getPostsByKeyword = async (keyword, page = 1, limit = 12) => {
    const skip = (Number(page) - 1) * Number(limit);

    // 同時查詢貼文與活動
    const [posts, events] = await Promise.all([
        prisma.comm_post.findMany({
            where: {
                context: {
                    contains: keyword,
                },
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
        }),
        prisma.comm_events.findMany({
            where: {
                OR: [
                    { title: { contains: keyword } },
                    { description: { contains: keyword } },
                    { location: { contains: keyword } },
                ],
            },
            take: Number(limit),
            skip: skip,
            orderBy: {
                comm_event_id: 'desc',
            },
            include: {
                comm_events_photo: {
                    select: {
                        photo_name: true,
                        img: true,
                        img_url: true,
                    },
                },
            },
        }),
    ]);

    // 格式化貼文
    const formattedPosts = posts.map((post) => {
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
            type: 'post',
        };
    });

    // 格式化活動
    const formattedEvents = events.map((event) => {
        const photo = event.comm_events_photo[0];
        const imgSource = transformImgSource(photo);

        return {
            ...event,
            start_date: dayjs(event.start_date).format('YYYY[年] MM[月]DD[日]'),
            start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
            end_date: dayjs(event.end_date).format('YYYY[年] MM[月]DD[日]'),
            end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
            photo_name: photo?.photo_name,
            img: imgSource,
            type: 'event',
        };
    });

    // 合併結果並按 ID 倒序排列（或是您偏好的排序邏輯）
    const combined = [...formattedPosts, ...formattedEvents].sort((a, b) => {
        const idA = a.type === 'post' ? a.post_id : a.comm_event_id;
        const idB = b.type === 'post' ? b.post_id : b.comm_event_id;
        return idB - idA;
    });

    return combined.slice(0, limit);
};
