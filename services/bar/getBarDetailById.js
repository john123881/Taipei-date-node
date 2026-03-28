import prisma from '../../utils/prisma-client.js';

export const getBarDetailById = async (bar_id) => {
    const bar = await prisma.bars.findFirst({
        where: {
            bar_id: Number(bar_id),
        },
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

    if (!bar) return null;

    return {
        ...bar,
        bar_area_name: bar.bar_area?.bar_area_name,
        bar_type_name: bar.bar_type?.bar_type_name,
        bar_pic_id: bar.bar_pic[0]?.bar_pic_id,
        bar_pic_name: bar.bar_pic[0]?.bar_pic_name,
    };
};
