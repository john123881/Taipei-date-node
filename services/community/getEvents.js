import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';
import dayjs from 'dayjs';

export const getEvents = async (page = 1, limit = 12, seed = null) => {
    const offset = (Number(page) - 1) * Number(limit);
    
    // 如果沒有提供 seed，則使用當前的日期小時作為預設種子
    const finalSeed = (seed !== null && seed !== undefined) ? Number(seed) : Math.floor(Date.now() / 3600000);

    // Using raw SQL for RAND(seed) support which Prisma doesn't natively have for findMany
    const results = await prisma.$queryRaw`
        SELECT 
            e.comm_event_id,
            e.title,
            e.description,
            e.location,
            e.start_date,
            e.start_time,
            e.end_date,
            e.end_time,
            e.status,
            e.user_id,
            p.photo_name,
            p.img,
            p.img_url
        FROM 
            comm_events AS e
        LEFT JOIN 
            comm_events_photo AS p
        ON 
            e.comm_event_id = p.comm_event_id
        ORDER BY 
            RAND(${finalSeed})
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const startDateFormat = 'YYYY[年] MM[月]DD[日]';
    const endDateFormat = 'YYYY[年] MM[月]DD[日]';

    return results.map((event) => {
        const imgSource = transformImgSource(event); // results from raw query already have p.img joined

        return {
            ...event,
            start_date: dayjs(event.start_date).format(startDateFormat),
            start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
            end_date: dayjs(event.end_date).format(endDateFormat),
            end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
            img: imgSource,
            type: 'event',
        };
    });
};
