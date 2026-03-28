import prisma from '../../utils/prisma-client.js';

export const editAddBar = async (trip_detail_id, bar_id) => {
    try {
        return await prisma.trip_details.update({
            where: {
                trip_detail_id: Number(trip_detail_id),
            },
            data: {
                bar_id: Number(bar_id),
            },
        });
    } catch (error) {
        console.error('Error updating bar in trip detail:', error);
        throw error;
    }
};
