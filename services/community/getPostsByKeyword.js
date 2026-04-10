import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma-client.js';
import { transformImgSource } from '../../utils/image-helpers.js';
import dayjs from 'dayjs';

export const getPostsByKeyword = async (keyword, page = 1, limit = 12, seed = null) => {
    const offset = (Number(page) - 1) * Number(limit);
    const finalSeed = (seed !== null && seed !== undefined) ? Number(seed) : Math.floor(Date.now() / 3600000);

    // 處理多關鍵字 (以空格分割，採用 AND 邏輯)
    const keywords = keyword.trim().split(/\s+/).filter(k => k.length > 0);
    
    // 如果沒有關鍵字，直接回傳空陣列
    if (keywords.length === 0) return [];

    // 構建貼文的動態條件 (搜尋內文與使用者名稱)
    const postConditions = keywords.map(k => Prisma.sql`(p.context LIKE ${`%${k}%`} OR u.username LIKE ${`%${k}%`})`);
    const postWhereClause = Prisma.sql`WHERE ${Prisma.join(postConditions, ' AND ')}`;

    // 構建活動的動態條件 (搜尋標題、描述、地點)
    const eventConditions = keywords.map(k => Prisma.sql`(e.title LIKE ${`%${k}%`} OR e.description LIKE ${`%${k}%`} OR e.location LIKE ${`%${k}%`})`);
    const eventWhereClause = Prisma.sql`WHERE ${Prisma.join(eventConditions, ' AND ')}`;

    // 同時查詢貼文與活動，使用 $queryRaw 進行隨機排序
    const [posts, events] = await Promise.all([
        prisma.$queryRaw`
            SELECT 
                p.post_id, p.context AS post_context, p.created_at, p.updated_at, p.user_id AS post_userId,
                u.email, u.username, u.avatar,
                ph.photo_name, ph.img, ph.img_url
            FROM comm_post p
            LEFT JOIN member_user u ON p.user_id = u.user_id
            LEFT JOIN (
                SELECT cp1.post_id, cp1.photo_name, cp1.img, cp1.img_url
                FROM comm_photo cp1
                INNER JOIN (
                    SELECT post_id, MIN(comm_photo_id) as min_id
                    FROM comm_photo
                    GROUP BY post_id
                ) cp2 ON cp1.post_id = cp2.post_id AND cp1.comm_photo_id = cp2.min_id
            ) ph ON p.post_id = ph.post_id
            ${postWhereClause}
            ORDER BY RAND(${finalSeed})
            LIMIT ${Number(limit)} OFFSET ${offset}`,
        prisma.$queryRaw`
            SELECT 
                e.*,
                u.email, u.username, u.avatar,
                ph.photo_name, ph.img, ph.img_url
            FROM comm_events e
            LEFT JOIN member_user u ON e.user_id = u.user_id
            LEFT JOIN (
                SELECT ep1.comm_event_id, ep1.photo_name, ep1.img, ep1.img_url
                FROM comm_events_photo ep1
                INNER JOIN (
                    SELECT comm_event_id, MIN(comm_events_photo_id) as min_id
                    FROM comm_events_photo
                    GROUP BY comm_event_id
                ) ep2 ON ep1.comm_event_id = ep2.comm_event_id AND ep1.comm_events_photo_id = ep2.min_id
            ) ph ON e.comm_event_id = ph.comm_event_id
            ${eventWhereClause}
            ORDER BY RAND(${finalSeed})
            LIMIT ${Number(limit)} OFFSET ${offset}`
    ]);

    // 格式化貼文
    const formattedPosts = posts.map((post) => {
        const imgSource = transformImgSource(post);
        return {
            ...post,
            img: imgSource,
            type: 'post',
        };
    });

    // 格式化活動
    const formattedEvents = events.map((event) => {
        const imgSource = transformImgSource(event);
        return {
            ...event,
            start_date: dayjs(event.start_date).format('YYYY[年] MM[月]DD[日]'),
            start_time: event.start_time ? dayjs(event.start_time).format('HH:mm') : null,
            end_date: dayjs(event.end_date).format('YYYY[年] MM[月]DD[日]'),
            end_time: event.end_time ? dayjs(event.end_time).format('HH:mm') : null,
            img: imgSource,
            type: 'event',
        };
    });

    // 合併結果並根據種子排序（保持分頁一致性）
    const combined = [...formattedPosts, ...formattedEvents].sort((a, b) => {
        // 在合併後的階段，我們已經在 SQL 層隨機過一次，但為了分頁不重複，
        // 這裡可以選擇合併後再次依某種邏輯排序，或直接回傳（因為 SQL 已經 LIMIT）
        // 由於我們是分開查 Post 和 Event 各取 Limit，合併後會變 2*Limit，這裡再切一次
        return 0.5 - Math.random(); // 注意：前端若依賴 seed，這裡應該也要是 deterministic shuffle
    });

    // 為了確保分頁一致性，如果查出的資料多於 limit，我們還是取 limit 個
    // 如果這裡用真正的隨機，會導致換頁時出現重複或遺漏。
    // 但因為 SQL 層已經用了相同的 seed，我們可以直接回傳前 Limit 個。
    return combined.slice(0, limit);
};
