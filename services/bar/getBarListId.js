import prisma from '../../utils/prisma-client.js';

export const getBarListId = async (barId) => {
    const results = await prisma.bars.findMany({
        where: {
            bar_id: Number(barId),
        },
        include: {
            bar_area: true,
            bar_type: true,
            bar_pic: true,
        },
    });

    return results.map((bar) => {
        const firstPic = bar.bar_pic[0];
        let formatted = {
            ...bar,
            bar_area_name: bar.bar_area?.bar_area_name,
            bar_type_name: bar.bar_type?.bar_type_name,
            bar_pic_id: firstPic?.bar_pic_id,
            bar_pic_name: firstPic?.bar_pic_name,
        };

        if (firstPic?.bar_img) {
            const imageBase64 = Buffer.from(firstPic.bar_img).toString('base64');
            formatted.bar_img = `data:image/jpeg;base64,${imageBase64}`;
        }

        return formatted;
    });
};
