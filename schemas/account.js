import { z } from 'zod';

// 通用的 SID 驗證 (路徑參數)
export const sidSchema = z.object({
    params: z.object({
        sid: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'sid 必須為數字' }),
    }),
});

// 編輯個人資料驗證
export const editProfileSchema = z.object({
    params: z.object({
        sid: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'sid 必須為數字' }),
    }),
    body: z.object({
        nickname: z.string().optional().nullable(),
        birthday: z.string().optional().nullable(),
        gender: z.string().optional().nullable(),
        mobile: z.string().optional().nullable(),
        bar_type_id: z.union([z.string(), z.number()]).transform(val => Number(val)).optional().nullable(),
        movie_type_id: z.union([z.string(), z.number()]).transform(val => Number(val)).optional().nullable(),
    }).passthrough(),
});

// 上傳頭像驗證
export const uploadAvatarSchema = z.object({
    params: z.object({
        sid: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'sid 必須為數字' }),
    }),
});

// 收藏相關驗證
export const collectItemSchema = z.object({
    body: z.object({
        sid: z.union([z.string(), z.number()]).transform(val => Number(val)),
        itemId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    }),
});

export const getCollectionSchema = z.object({
    params: z.object({
        sid: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'sid 必須為數字' }),
    }),
    query: z.object({
        page: z.string().transform(val => parseInt(val, 10)).optional().default('1'),
    }),
});

export const deleteCollectionSchema = z.object({
    params: z.object({
        save_id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), { message: 'save_id 必須為數字' }),
    }),
});
