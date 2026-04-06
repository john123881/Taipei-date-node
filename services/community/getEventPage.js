import prisma from '../../utils/prisma-client.js';
import dayjs from 'dayjs';

export const getEventPage = async (eventId) => {
    const safeEventId = Number(eventId);
    if (isNaN(safeEventId)) return [];

    try {
        const event = await prisma.comm_events.findUnique({
            where: {
                comm_event_id: safeEventId,
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

        if (!event) return [];

        // Fetch organizer info separately
        let organizer = null;
        try {
            organizer = await prisma.member_user.findUnique({
                where: { user_id: event.user_id },
                select: {
                    username: true,
                    avatar: true,
                }
            });
        } catch (e) {
            console.error('[Service Error] getEventPage - organizer:', e);
        }

        const startDateFormat = 'YYYY[年] MM[月]DD[日]';
        const endDateFormat = 'YYYY[年] MM[月]DD[日]';

        const photo = event.comm_events_photo && event.comm_events_photo[0];
        let imgSource = null;
        if (photo && photo.img_url) {
            imgSource = photo.img_url;
        } else if (photo && photo.img) {
            try {
                imgSource = `data:image/jpeg;base64,${Buffer.from(photo.img).toString('base64')}`;
            } catch (e) {
                console.error('[Service Error] getEventPage - image conversion:', e);
            }
        }

        let participant_count = 0;
        let firstParticipantData = null;
        try {
            participant_count = await prisma.comm_participants.count({
                where: { comm_event_id: safeEventId }
            });

            const firstParticipant = await prisma.comm_participants.findFirst({
                where: { comm_event_id: safeEventId }
            });

            if (firstParticipant) {
                firstParticipantData = await prisma.member_user.findUnique({
                    where: { user_id: firstParticipant.user_id },
                    select: { username: true }
                });
            }
        } catch (e) {
            console.error('[Service Error] getEventPage - participants:', e);
        }

        return [{
            ...event,
            start_date: event.start_date ? dayjs(event.start_date).format(startDateFormat) : null,
            start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
            end_date: event.end_date ? dayjs(event.end_date).format(endDateFormat) : null,
            end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
            photo_name: photo?.photo_name,
            img: imgSource,
            organizer_name: organizer?.username || '神秘主辦人',
            organizer_avatar: organizer?.avatar,
            participant_count: participant_count,
            first_participant_name: firstParticipantData?.username || null
        }];
    } catch (error) {
        console.error('[Service Error] getEventPage - main:', error);
        throw error;
    }
};
