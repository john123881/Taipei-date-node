import prisma from '../../utils/prisma-client.js';
import dayjs from 'dayjs';
import { EVENT_STATUS } from '../../config/community-info.js';

export const createEvent = async (
    title,
    description,
    status,
    location,
    userId,
    startDate,
    startTime,
    endDate,
    endTime
) => {
    // Handle status mapping: use provided status or default to OPEN
    const eventStatus = status ? String(status) : EVENT_STATUS.OPEN;

    const newEvent = await prisma.comm_events.create({
        data: {
            title,
            description,
            status: eventStatus,
            location,
            user_id: Number(userId),
            start_date: new Date(startDate),
            start_time: startTime, // Assuming string format works or handle appropriately
            end_date: new Date(endDate),
            end_time: endTime,
        },
    });

    const event = await prisma.comm_events.findUnique({
        where: {
            comm_event_id: newEvent.comm_event_id,
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

    if (event) {
        const startDateFormat = 'YYYY[年] MM[月]DD[日]';
        const endDateFormat = 'YYYY[年] MM[月]DD[日]';

        const photo = event.comm_events_photo[0];
        let imgSource = null;
        if (photo && photo.img_url) {
            imgSource = photo.img_url;
        } else if (photo && photo.img) {
            imgSource = `data:image/jpeg;base64,${Buffer.from(photo.img).toString('base64')}`;
        }

        return {
            ...event,
            start_date: dayjs(event.start_date).format(startDateFormat),
            start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
            end_date: dayjs(event.end_date).format(endDateFormat),
            end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
            photo_name: photo?.photo_name,
            img: imgSource,
        };
    }

    return newEvent;
};
