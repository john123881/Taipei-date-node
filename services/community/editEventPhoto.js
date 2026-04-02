import prisma from '../../utils/prisma-client.js';
import dayjs from 'dayjs';
import { uploadToS3 } from '../../utils/s3-core.js';

export const editEventPhoto = async (photoName, imageData, eventId) => {
    // 1. 上傳到 S3
    const s3Url = await uploadToS3(imageData, photoName, 'events');

    // 2. 更新資料庫
    await prisma.comm_events_photo.updateMany({
        where: {
            comm_event_id: Number(eventId),
        },
        data: {
            photo_name: photoName,
            img: Buffer.alloc(0),
            img_url: s3Url,
        },
    });

    const event = await prisma.comm_events.findUnique({
        where: {
            comm_event_id: Number(eventId),
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

    return null;
};
