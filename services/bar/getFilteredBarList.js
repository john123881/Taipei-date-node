import prisma from '../../utils/prisma-client.js';

export const getFilteredBarList = async (filters = {}) => {
    const { bar_area_id, bar_type_id } = filters;
    
    const where = {};
    if (bar_area_id) where.bar_area_id = Number(bar_area_id);
    if (bar_type_id) where.bar_type_id = Number(bar_type_id);

    const results = await prisma.bars.findMany({
        where,
        include: {
            bar_area: true,
            bar_type: true,
            bar_pic: {
                select: {
                    bar_pic_id: true,
                    bar_pic_name: true,
                },
            },
        },
    });

    return results.map((bar) => ({
        ...bar,
        bar_area_name: bar.bar_area?.bar_area_name,
        bar_type_name: bar.bar_type?.bar_type_name,
        bar_pic_id: bar.bar_pic[0]?.bar_pic_id,
        bar_pic_name: bar.bar_pic[0]?.bar_pic_name,
    }));
};
