import prisma from '../../utils/prisma-client.js';

export const searchBars = async (searchTerm) => {
    const results = await prisma.bars.findMany({
        where: {
            OR: [
                { bar_name: { startsWith: searchTerm } },
                {
                    bar_area: {
                        bar_area_name: { startsWith: searchTerm },
                    },
                },
                {
                    bar_type: {
                        bar_type_name: { startsWith: searchTerm },
                    },
                },
            ],
        },
        include: {
            bar_area: true,
            bar_type: true,
            bar_pic: {
                select: {
                    bar_pic_id: true,
                    bar_pic_name: true,
                    bar_img: true,
                },
            },
        },
    });

    return results.map((bar) => {
        let barData = {
            ...bar,
            bar_area_name: bar.bar_area?.bar_area_name,
            bar_type_name: bar.bar_type?.bar_type_name,
            bar_pic_id: bar.bar_pic[0]?.bar_pic_id,
            bar_pic_name: bar.bar_pic[0]?.bar_pic_name,
        };

        // 處理 BLOB 圖片 (如果存在)
        const firstPic = bar.bar_pic[0];
        if (firstPic && firstPic.bar_img) {
            const imageBase64 = Buffer.from(firstPic.bar_img).toString('base64');
            barData.img = `data:image/jpeg;base64,${imageBase64}`;
        }

        return barData;
    });
};
