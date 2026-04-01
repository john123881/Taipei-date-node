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
