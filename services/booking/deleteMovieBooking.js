import prisma from '../../utils/prisma-client.js';

export const deleteMovieBooking = async (bookingId) => {
    return await prisma.booking_system.delete({
        where: {
            booking_id: Number(bookingId),
        },
    });
};
