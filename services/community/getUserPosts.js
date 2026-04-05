import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';

export const getUserPosts = async (userId, page = 1, limit = 12) => {
    const skip = (Number(page) - 1) * Number(limit);
    
    // 1. 加入初始 Log
    console.log(`[Debug] 開始獲取用戶貼文, UID: ${userId}, Page: ${page}`);

    try {
        // 2. 執行查詢
        const results = await prisma.comm_post.findMany({
            where: {
                user_id: Number(userId),
            },
            take: Number(limit),
            skip: skip,
            orderBy: {
                post_id: 'desc',
            },
            include: {
                member_user: {
                    select: {
                        email: true,
                        username: true,
                        avatar: true,
                    },
                },
                comm_photo: {
                    select: {
                        photo_name: true,
                        img: true,
                        img_url: true,
                    },
                },
            },
        });

        console.log(`[Debug] 資料庫查詢完成，找到 ${results.length} 筆貼文`);

        // 3. 防禦性映射資料
        return results.map((post, index) => {
            try {
                // 確保 comm_photo 存在且不為空
                const photo = (post.comm_photo && post.comm_photo.length > 0) 
                    ? post.comm_photo[0] 
                    : null;
                
                const imgSource = transformImgSource(photo);

                return {
                    post_id: post.post_id,
                    post_context: post.context || '',
                    created_at: post.created_at,
                    updated_at: post.updated_at,
                    post_userId: post.user_id,
                    email: post.member_user?.email || 'N/A',
                    username: post.member_user?.username || 'Anonymous',
                    avatar: post.member_user?.avatar || null,
                    photo_name: photo?.photo_name || null,
                    img: imgSource,
                };
            } catch (mapErr) {
                console.error(`[Debug] 第 ${index} 筆貼文處理失敗:`, mapErr);
                return null; // 若單筆失敗則跳過
            }
        }).filter(post => post !== null);

    } catch (dbError) {
        // 4. 精確捕捉資料庫錯誤 (例如: 欄位不存在或連線中斷)
        console.error('[Debug] getUserPosts 資料庫異常:', dbError);
        throw dbError; // 讓路由層捕捉並回傳 500
    }
};
