import prisma from '../../utils/prisma-client.js';

export const getBarBookingList = async () => {
    const results = await prisma.bar_booking.findMany({
        include: {
            bars: {
                include: {
                    bar_pic: true,
                },
            },
            bar_time_slots: true,
            member_user: true,
        },
        orderBy: {
            bar_booking_time: 'desc',
        },
    });

    return results.map((booking) => {
        const bar = booking.bars;
        const firstPic = bar?.bar_pic[0];

        return {
            ...booking,
            bar_id: bar?.bar_id,
            bar_name: bar?.bar_name,
            bar_addr: bar?.bar_addr,
            bar_contact: bar?.bar_contact,
            bar_time_slot_id: booking.bar_time_slot_id,
            bar_start_time: booking.bar_time_slots?.bar_start_time,
            user_id: booking.user_id,
            username: booking.member_user?.username,
            bar_pic_id: firstPic?.bar_pic_id,
            bar_pic_name: firstPic?.bar_pic_name,
        };
    });
};
