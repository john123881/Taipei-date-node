import prisma from '../../utils/prisma-client.js';

//刪除單筆資料
export const deleteDetail = async (trip_detail_id) => {
    try {
        return await prisma.trip_details.delete({
            where: {
                trip_detail_id: Number(trip_detail_id),
            },
        });
    } catch (error) {
        console.error('Error deleting trip detail:', error);
        throw error;
    }
};
