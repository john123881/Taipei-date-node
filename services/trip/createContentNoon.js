import prisma from '../../utils/prisma-client.js';

//新增單筆資料
export const createContentNoon = async (trip_plan_id) => {
    return await prisma.trip_details.create({
        data: {
            trip_plan_id: Number(trip_plan_id),
            block: 2,
        },
    });
};
