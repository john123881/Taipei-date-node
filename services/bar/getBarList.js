import prisma from '../../utils/prisma-client.js';

export const getBarList = async () => {
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

    // 格式化返回數據以符合原有的扁平結構（如果需要）
    return results.map((bar) => {
        const firstPic = bar.bar_pic[0];
        let imgSource = null;
        if (firstPic && firstPic.bar_img_url) {
            imgSource = firstPic.bar_img_url;
        } else if (firstPic && firstPic.bar_img) {
            imgSource = `data:image/jpeg;base64,${Buffer.from(firstPic.bar_img).toString('base64')}`;
        }

        return {
            ...bar,
            bar_area_name: bar.bar_area?.bar_area_name,
            bar_type_name: bar.bar_type?.bar_type_name,
            bar_pic_id: firstPic?.bar_pic_id,
            bar_pic_name: firstPic?.bar_pic_name,
            img: imgSource,
        };
    });
};
