import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getBarDetail = async () => {
    const results = await prisma.bars.findMany({
        include: {
            bar_area: true,
            bar_type: true,
            bar_pic: {
                select: {
                    bar_pic_id: true,
                    bar_pic_name: true,
                    bar_img: true,
                    bar_img_url: true,
                },
            },
        },
    });

    return results.map((bar) => {
        const firstPic = bar.bar_pic[0];
        const imgSource = transformImgSource(firstPic, { imgKey: 'bar_img', urlKey: 'bar_img_url' });

        return {
            ...bar,
            bar_area_name: bar.bar_area?.bar_area_name,
            bar_type_name: bar.bar_type?.bar_type_name,
            bar_pic_id: firstPic?.bar_pic_id,
            bar_pic_name: firstPic?.bar_pic_name,
            bar_img_url: firstPic?.bar_img_url,
            img: imgSource,
        };
    });
};
