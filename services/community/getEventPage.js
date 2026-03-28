import prisma from '../../utils/prisma-client.js';
import dayjs from 'dayjs';

export const getEventPage = async (eventId) => {
    const event = await prisma.comm_events.findUnique({
        where: {
            comm_event_id: Number(eventId),
        },
        include: {
            comm_events_photo: {
                select: {
                    photo_name: true,
                    img: true,
                },
            },
        },
    });

    if (!event) return [];

    const startDateFormat = 'YYYY[年] MM[月]DD[日]';
    const endDateFormat = 'YYYY[年] MM[月]DD[日]';

    const photo = event.comm_events_photo[0];
    let imgBase64 = null;
    if (photo && photo.img) {
        imgBase64 = `data:image/jpeg;base64,${Buffer.from(photo.img).toString('base64')}`;
    }

    return [{
        ...event,
        start_date: dayjs(event.start_date).format(startDateFormat),
        start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
        end_date: dayjs(event.end_date).format(endDateFormat),
        end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
        photo_name: photo?.photo_name,
        img: imgBase64,
    }];
};
