import prisma from "../../utils/prisma-client.js";

export const updateProfile = async (sid, data) => {
    // 1. 查詢類型對照ID
    const barType = await prisma.bar_type.findFirst({
        where: { bar_type_name: data.fav1 }
    });
    const barTypeId = barType ? barType.bar_type_id : 0;

    const movieType = await prisma.booking_movie_type.findFirst({
        where: { movie_type: data.fav2 }
    });
    const movieTypeId = movieType ? movieType.movie_type_id : 0;

    // 2. 更新資料
    return await prisma.member_user.update({
        where: { user_id: sid },
        data: {
            email: data.email,
            username: data.username,
            gender: data.gender,
            birthday: data.birthday ? new Date(data.birthday) : null,
            mobile: data.mobile,
            profile_content: data.profile,
            bar_type_id: barTypeId,
            movie_type_id: movieTypeId,
            updated_at: new Date()
        }
    });
};

export const getAllTypes = async () => {
    const barTypes = await prisma.bar_type.findMany({ select: { bar_type_name: true } });
    const movieTypes = await prisma.booking_movie_type.findMany({ select: { movie_type: true } });
    return { barTypes, movieTypes };
};
