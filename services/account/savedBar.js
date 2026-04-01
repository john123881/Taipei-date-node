import prisma from "../../utils/prisma-client.js";

export const getSavedBars = async (sid, page, perPage) => {
    const totalRows = await prisma.bar_saved.count({ where: { user_id: sid } });
    if (totalRows === 0) return { totalRows, data: [] };

    const totalPages = Math.ceil(totalRows / perPage);
    const savedBars = await prisma.bar_saved.findMany({
        where: { user_id: sid },
        orderBy: { bar_saved_id: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
            member_user: { select: { email: true, username: true } },
            bars: {
                include: {
                    bar_area: true,
                    bar_type: true,
                    bar_pic: { select: { bar_pic_name: true, bar_img: true, bar_img_url: true }, take: 1 }
                }
            }
        }
    });

    const formattedData = savedBars.map(item => {
        const bar = item.bars;
        const user = item.member_user;
        const photo = bar?.bar_pic?.[0];
        let imgData = null;
        if (photo?.bar_img_url) {
            imgData = photo.bar_img_url;
        } else if (photo?.bar_img) {
            imgData = `data:image/jpeg;base64,${Buffer.from(photo.bar_img).toString('base64')}`;
        }
        return {
            save_id: item.bar_saved_id,
            email: user?.email,
            username: user?.username,
            bar_id: bar?.bar_id,
            bar_name: bar?.bar_name,
            area: bar?.bar_area?.bar_area_name,
            address: bar?.bar_addr,
            type: bar?.bar_type?.bar_type_name,
            contact: bar?.bar_contact,
            description: bar?.bar_description,
            img_name: photo?.bar_pic_name,
            img: imgData
        };
    });

    return { totalRows, totalPages, data: formattedData };
};

export const deleteSavedBar = async (save_id) => {
    const existing = await prisma.bar_saved.findUnique({ where: { bar_saved_id: save_id } });
    if (!existing) return null;
    return await prisma.bar_saved.delete({ where: { bar_saved_id: save_id } });
};
