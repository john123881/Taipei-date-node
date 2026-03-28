import prisma from '../../utils/prisma-client.js';

/**
 * 取得使用者的好友最新一筆訊息
 * 對應原始 SQL 的 ROW_NUMBER() OVER (PARTITION BY ...)
 */
export const getLatestMessages = async (user_id) => {
    try {
        const userIdNum = Number(user_id);

        // 使用 $queryRaw 來執行複雜的 SQL，確保效能與原始邏輯一致
        // 1. 找出使用者發送的最新訊息 (rn=1)
        // 2. 獲取對方的名稱與頭像
        const results = await prisma.$queryRaw`
            SELECT 
                sub.message_id,
                sub.friendship_id,
                sub.sender_id,
                sub.sender_name,
                sub.content,
                sub.sended_at,
                sub.avatar,
                friends.friend_name AS other_friend_name,
                friends.friend_avatar AS other_friend_avatar,
                friends.other_friend_id,
                friends.friendship_status
            FROM (
                SELECT 
                    fm.message_id, 
                    fm.friendship_id,
                    fm.sender_id,
                    mu.username AS sender_name,
                    fm.content,
                    fm.sended_at,
                    mu.avatar,
                    ROW_NUMBER() OVER (PARTITION BY fm.friendship_id ORDER BY fm.message_id DESC) AS rn  
                FROM 
                    friendships_message fm
                JOIN 
                    member_user mu 
                ON 
                    fm.sender_id = mu.user_id
                WHERE 
                    fm.sender_id = ${userIdNum}
            ) AS sub
            JOIN (
                SELECT 
                    f.friendship_id,
                    CASE 
                        WHEN f.user_id1 = ${userIdNum} THEN mu2.username
                        ELSE mu1.username
                    END AS friend_name,
                    CASE 
                        WHEN f.user_id1 = ${userIdNum} THEN mu2.avatar
                        ELSE mu1.avatar
                    END AS friend_avatar,
                    CASE 
                        WHEN f.user_id1 = ${userIdNum} THEN f.user_id2
                        ELSE f.user_id1
                    END AS other_friend_id,
                    f.friendship_status
                FROM 
                    friendships f
                JOIN 
                    member_user mu1 
                ON 
                    f.user_id1 = mu1.user_id
                JOIN 
                    member_user mu2 
                ON 
                    f.user_id2 = mu2.user_id
            ) AS friends
            ON sub.friendship_id = friends.friendship_id
            WHERE 
                sub.rn = 1  
                AND friends.friendship_status = 'accepted'
            ORDER BY 
                sub.message_id DESC
        `;

        return results;
    } catch (error) {
        console.error('getLatestMessages error:', error);
        throw error;
    }
};
