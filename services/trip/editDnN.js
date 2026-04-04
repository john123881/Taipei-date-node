import prisma from '../../utils/prisma-client.js';

export const editDnN = async (trip_plan_id, trip_description, trip_notes, trip_title, trip_date) => {
    try {
        const updateData = {
            trip_description,
            trip_notes,
        };

        if (trip_title) updateData.trip_title = trip_title;
        
        if (trip_date) {
            const dateObj = new Date(trip_date);
            if (!isNaN(dateObj.getTime())) {
                updateData.trip_date = dateObj;
            } else {
                 console.warn(`Invalid date encountered in editDnN: ${trip_date}`);
                 // 如果日期無效，則不更新此欄位或是執行其它降級邏輯
            }
        }

        return await prisma.trip_plans.update({
            where: {
                trip_plan_id: Number(trip_plan_id),
            },
            data: updateData,
        });
    } catch (error) {
        console.error('Error updating Trip plan:', error);
        throw error;
    }
};
