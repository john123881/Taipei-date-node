import prisma from '../../utils/prisma-client.js';

export const getFilteredBarList = async (filters = {}) => {
    const { bar_area_id, bar_type_id, searchTerm } = filters;
    
    let where = {};
    
    // 基礎篩選
    if (bar_area_id) where.bar_area_id = Number(bar_area_id);
    if (bar_type_id) where.bar_type_id = Number(bar_type_id);

    // 關鍵字搜尋 (如果有的話)
    if (searchTerm) {
        where.OR = [
            { bar_name: { contains: searchTerm } },
            {
                bar_area: {
                    bar_area_name: { contains: searchTerm },
                },
            },
            {
                bar_type: {
                    bar_type_name: { contains: searchTerm },
                },
            },
        ];
    }

    const results = await prisma.bars.findMany({
        where,
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
            bar_img_url: firstPic?.bar_img_url,
            img: imgSource,
        };
    });
};
