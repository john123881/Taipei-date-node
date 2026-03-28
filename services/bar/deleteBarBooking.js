import prisma from '../../utils/prisma-client.js';

export const deleteBarBooking = async (barBookingId) => {
    return await prisma.bar_booking.delete({
        where: {
            bar_booking_id: Number(barBookingId),
        },
    });
};
