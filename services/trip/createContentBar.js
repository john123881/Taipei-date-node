import prisma from '../../utils/prisma-client.js';

// 新增單筆 bar 資料到 trip_details
export const createContentBar = async (trip_plan_id, bar_id, block) => {
    return await prisma.trip_details.create({
        data: {
            trip_plan_id: Number(trip_plan_id),
            block: Number(block),
            bar_id: Number(bar_id),
        },
    });
};
