import prisma from '../../utils/prisma-client.js';

export const getBarDetail = async () => {
    const results = await prisma.bars.findMany({
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
