import { z } from 'zod';

/**
 * 環境變數驗證規則
 */
export const envSchema = z.object({
    // 資料庫配置
    DB_HOST: z.string().min(1, '必須提供 DB_HOST'),
    DB_PORT: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    DB_USER: z.string().min(1, '必須提供 DB_USER'),
    DB_PASS: z.string().min(1, '必須提供 DB_PASS'),
    DB_NAME: z.string().min(1, '必須提供 DB_NAME'),

    // 金鑰與認證
    JWT_SECRET: z.string().min(16, 'JWT_SECRET 長度不足'),
    SESSION_SECRET: z.string().min(16, 'SESSION_SECRET 長度不足'),
    OTP_SECRET: z.string().min(1, '必須提供 OTP_SECRET'),

    // AWS S3 配置
    AWS_ACCESS_KEY_ID: z.string().min(1, '必須提供 AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, '必須提供 AWS_SECRET_ACCESS_KEY'),
    AWS_REGION: z.string().min(1, '必須提供 AWS_REGION'),
    AWS_BUCKET_NAME: z.string().min(1, '必須提供 AWS_BUCKET_NAME'),

    // SMTP 信件配置
    SMTP_TO_EMAIL: z.string().email('SMTP_TO_EMAIL 格式不正確'),
    SMTP_TO_PASSWORD: z.string().min(1, '必須提供 SMTP_TO_PASSWORD'),
});
