import prisma from '../../utils/prisma-client.js';

export const getBarSaved = async () => {
    return await prisma.bars.findMany({
        include: {
            bar_area: {
                select: {
                    bar_area_name: true,
                },
            },
            bar_type: {
                select: {
                    bar_type_name: true,
                },
            },
            bar_pic: {
                select: {
                    bar_pic_name: true,
                    bar_img: true,
                    bar_img_url: true,
                },
            },
        },
    });
};
