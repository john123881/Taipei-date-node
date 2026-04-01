import prisma from '../../utils/prisma-client.js';

export const getBarBookingListById = async (user_id) => {
    const results = await prisma.bar_booking.findMany({
        where: {
            user_id: Number(user_id),
        },
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

        let formatted = {
            ...booking,
            bar_id: bar?.bar_id,
            bar_name: bar?.bar_name,
            bar_addr: bar?.bar_addr,
            bar_time_slot_id: booking.bar_time_slot_id,
            user_id: booking.user_id,
            username: booking.member_user?.username,
            bar_pic_id: firstPic?.bar_pic_id,
            bar_pic_name: firstPic?.bar_pic_name,
        };

        if (firstPic?.bar_img_url) {
            formatted.bar_img = firstPic.bar_img_url;
        } else if (firstPic?.bar_img) {
            const imageBase64 = Buffer.from(firstPic.bar_img).toString('base64');
            formatted.bar_img = `data:image/jpeg;base64,${imageBase64}`;
        }

        return formatted;
    });
};
