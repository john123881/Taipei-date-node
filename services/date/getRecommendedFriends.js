import prisma from '../../utils/prisma-client.js';

export const getRecommendedFriends = async (user_id, bar_type_id, movie_type_id) => {
    try {
        const uId = Number(user_id);
        const bId = Number(bar_type_id);
        const mId = Number(movie_type_id);

        // 原始 SQL 特色：排除自己，匹配興趣，且尚未建立任何好友關係 (friendships IS NULL)
        // 在 Prisma 中，我們可以找 member_user，
        // 條件：interest 匹配，不是自己，且沒有與自己的 friendship。
        
        return await prisma.member_user.findMany({
            where: {
                user_id: { not: uId },
                bar_type_id: bId,
                movie_type_id: mId,
                // 排除已經有好友關係的
                AND: [
                    {
                        friendships_friendships_user_id1Tomember_user: {
                            none: { user_id2: uId }
                        }
                    },
                    {
                        friendships_friendships_user_id2Tomember_user: {
                            none: { user_id1: uId }
                        }
                    }
                ]
            },
            select: {
                user_id: true,
                username: true,
                email: true,
                avatar: true,
                gender: true,
                user_active: true,
                birthday: true,
                profile_content: true,
                bar_type: {
                    select: { bar_type_id: true, bar_type_name: true }
                },
                movie_type: {
                    select: { movie_type_id: true, movie_type: true }
                }
            }
        });
    } catch (error) {
        console.error('getRecommendedFriends error:', error);
        throw error;
    }
};
