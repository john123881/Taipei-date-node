import prisma from '../../utils/prisma-client.js';

//新增單筆資料
export const createBarRating = async (bar_id, bar_rating_star, user_id) => {
    // 將評分數據插入到數據庫中
    const newRating = await prisma.bar_rating.create({
        data: {
            bar_id: Number(bar_id),
            bar_rating_star: Number(bar_rating_star),
            user_id: Number(user_id),
        },
        include: {
            bars: {
                select: {
                    bar_id: true,
                    bar_name: true,
                },
            },
            member_user: {
                select: {
                    user_id: true,
                    username: true,
                },
            },
        },
    });

    // 為了保持兼容性，返回一個數組（原代碼返回評分結果數組）
    return [
        {
            ...newRating,
            bar_name: newRating.bars?.bar_name,
            username: newRating.member_user?.username,
        },
    ];
};
