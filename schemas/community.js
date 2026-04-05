import { z } from 'zod';

/**
 * 社群模組驗證規則
 */
export const addCommentSchema = z.object({
    body: z.object({
        context: z.string().min(1, '留言內容不能為空'),
        status: z.union([z.string(), z.number()]),
        postId: z.union([z.string(), z.number()])
            .transform(val => Number(val))
            .refine(val => !isNaN(val), { message: 'postId 必須是有效的數字' }),
        userId: z.union([z.string(), z.number()])
            .transform(val => Number(val))
            .refine(val => !isNaN(val), { message: 'userId 必須是有效的數字' }),
    }),
});

export const createPostSchema = z.object({
    body: z.object({
        context: z.string().min(1, '貼文內容不能為空'),
        userId: z.union([z.string(), z.number()])
            .transform(val => Number(val))
            .refine(val => !isNaN(val), { message: 'userId 必須是有效的數字' }),
    }),
});

// 新增：關鍵字搜尋驗證
export const getPostsByKeywordSchema = z.object({
    query: z.object({
        keyword: z.string({ required_error: '必須提供關鍵字' }).min(1, '關鍵字不能為空').trim(),
        page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 12),
    }),
});

// 新增：取得留言驗證 (支援逗號分隔或陣列)
const numericIdArraySchema = z.union([z.string(), z.array(z.union([z.string(), z.number()]))])
    .transform((val) => {
        if (typeof val === 'string') return val.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
        return val.map(v => Number(v)).filter(v => !isNaN(v));
    })
    .refine(val => val.length > 0, { message: '至少需要一個有效的 ID' });

export const getCommentsSchema = z.object({
    query: z.object({
        postIds: numericIdArraySchema,
    }),
});

// 新增：檢查貼文狀態驗證
export const checkPostStatusSchema = z.object({
    query: z.object({
        userId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'userId 必須是數字' }),
        postIds: numericIdArraySchema,
    }),
});

// 新增：通用貼文互動驗證 (Like/Save)
export const postInteractionSchema = z.object({
    body: z.object({
        postId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
        userId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
    }),
});

// 新增：刪除相關驗證
export const deletePostSchema = z.object({
    body: z.object({
        postId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
    }),
});

export const deleteCommentSchema = z.object({
    body: z.object({
        commentId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
    }),
});

export const editCommentSchema = z.object({
    body: z.object({
        commentId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
        context: z.string().min(1, '留言內容不能為空'),
    }),
});

// 新增：搜尋使用者驗證
export const searchUsersSchema = z.object({
    query: z.object({
        searchTerm: z.string({ required_error: '必須提供搜尋字詞' }).min(1, '搜尋字詞不能為空').trim(),
    }),
});

// 新增：使用者貼文路徑參數驗證
export const getUserPostsSchema = z.object({
    params: z.object({
        userId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'userId 必須為數字' }),
    }),
    query: z.object({
        page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 12),
    }).optional(),
});

// 新增：單筆貼文/活動驗證
export const getPostPageSchema = z.object({
    params: z.object({
        postId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'postId 必須為數字' }),
    }),
});

export const getEventPageSchema = z.object({
    params: z.object({
        eventId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'eventId 必須為數字' }),
    }),
});

// 新增：追蹤相關驗證
export const followUserSchema = z.object({
    body: z.object({
        userId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
        followingId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
    }),
});

export const followingIdSchema = z.object({
    params: z.object({
        followingId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'followingId 必須為數字' }),
    }),
});

export const followerIdSchema = z.object({
    params: z.object({
        followerId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'followerId 必須為數字' }),
    }),
});

// 新增：活動相關驗證
export const eventInteractionSchema = z.object({
    body: z.object({
        eventId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
        userId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
    }),
});

export const checkEventStatusSchema = z.object({
    query: z.object({
        userId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'userId 必須是數字' }),
        eventIds: numericIdArraySchema,
    }),
});

export const deleteEventSchema = z.object({
    body: z.object({
        eventId: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val)),
    }),
});
