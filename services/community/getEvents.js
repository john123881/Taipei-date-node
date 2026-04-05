import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';
import dayjs from 'dayjs';

export const getEvents = async (page = 1, limit = 12) => {
    const skip = (Number(page) - 1) * Number(limit);
    const results = await prisma.comm_events.findMany({
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
    });

    const startDateFormat = 'YYYY[年] MM[月]DD[日]';
    const endDateFormat = 'YYYY[年] MM[月]DD[日]';

    return results.map((event) => {
        const photo = event.comm_events_photo[0];
        const imgSource = transformImgSource(photo);

        return {
            ...event,
            start_date: dayjs(event.start_date).format(startDateFormat),
            start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
            end_date: dayjs(event.end_date).format(endDateFormat),
            end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
            photo_name: photo?.photo_name,
            img: imgSource,
            type: 'event',
        };
    });
};
