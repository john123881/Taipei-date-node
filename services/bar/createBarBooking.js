import prisma from '../../utils/prisma-client.js';

export const createBarBooking = async (
    user_id,
    bar_id,
    bar_booking_time,
    bar_booking_people_num,
    bar_time_slot_id
) => {
    return await prisma.bar_booking.create({
        data: {
            user_id: Number(user_id),
            bar_id: Number(bar_id),
            bar_booking_time: new Date(bar_booking_time),
            bar_booking_people_num: Number(bar_booking_people_num),
            bar_time_slot_id: Number(bar_time_slot_id),
        },
    });
};
