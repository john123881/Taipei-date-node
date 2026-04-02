import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

// 獲取所有酒吧列表
export const getBarListType = async (bar_type_id) => {
    const results = await prisma.bars.findMany({
        where: {
            bar_type_id: Number(bar_type_id),
        },
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
        const bar_img = transformImgSource(firstPic, { imgKey: 'bar_img', urlKey: 'bar_img_url' });
        
        return {
            ...bar,
            bar_area_name: bar.bar_area?.bar_area_name,
            bar_type_name: bar.bar_type?.bar_type_name,
            bar_pic_id: firstPic?.bar_pic_id,
            bar_pic_name: firstPic?.bar_pic_name,
            bar_img,
        };
    });
};
